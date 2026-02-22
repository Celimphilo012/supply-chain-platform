// apps/api/src/modules/inventory/services/inventory.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Inventory } from '../entities/inventory.entity';
import {
  InventoryTransaction,
  TransactionType,
} from '../entities/inventory-transaction.entity';
import { AdjustInventoryDto } from '../dto/adjust-inventory.dto';
import { RealtimeService } from '../../realtime/realtime.service';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
    @InjectRepository(InventoryTransaction)
    private transactionRepository: Repository<InventoryTransaction>,
    private dataSource: DataSource,
    private realtimeService: RealtimeService,
  ) {}

  async getInventoryLevels(organizationId: string, warehouseId?: string) {
    const qb = this.inventoryRepository
      .createQueryBuilder('inv')
      .leftJoinAndSelect('inv.product', 'product')
      .leftJoinAndSelect('inv.warehouse', 'warehouse')
      .where('inv.organization_id = :organizationId', { organizationId });

    if (warehouseId) {
      qb.andWhere('inv.warehouse_id = :warehouseId', { warehouseId });
    }

    return qb.orderBy('product.name', 'ASC').getMany();
  }

  async getLowStockItems(organizationId: string) {
    return this.inventoryRepository
      .createQueryBuilder('inv')
      .leftJoinAndSelect('inv.product', 'product')
      .leftJoinAndSelect('inv.warehouse', 'warehouse')
      .where('inv.organization_id = :organizationId', { organizationId })
      .andWhere('inv.reorder_point IS NOT NULL')
      .andWhere('inv.quantity_on_hand <= inv.reorder_point')
      .getMany();
  }

  async adjust(
    organizationId: string,
    userId: string,
    dto: AdjustInventoryDto,
  ) {
    let quantityBefore = 0;
    let quantityAfter = 0;
    let savedTransaction: InventoryTransaction;

    await this.dataSource.transaction(async (manager) => {
      const inventory = await manager
        .createQueryBuilder(Inventory, 'inv')
        .setLock('pessimistic_write')
        .where(
          'inv.product_id = :productId AND inv.warehouse_id = :warehouseId',
          { productId: dto.productId, warehouseId: dto.warehouseId },
        )
        .getOne();

      quantityBefore = inventory?.quantityOnHand ?? 0;
      quantityAfter = quantityBefore + dto.quantityDelta;

      if (quantityAfter < 0) {
        throw new BadRequestException(
          `Insufficient stock. Current: ${quantityBefore}, Requested delta: ${dto.quantityDelta}`,
        );
      }

      if (inventory) {
        await manager.update(Inventory, inventory.id, {
          quantityOnHand: quantityAfter,
          updatedAt: new Date(),
        });
      } else {
        const newInventory = manager.create(Inventory, {
          organizationId,
          productId: dto.productId,
          warehouseId: dto.warehouseId,
          quantityOnHand: quantityAfter,
        });
        await manager.save(newInventory);
      }

      const transaction = manager.create(InventoryTransaction, {
        organizationId,
        productId: dto.productId,
        warehouseId: dto.warehouseId,
        transactionType: dto.transactionType,
        quantityDelta: dto.quantityDelta,
        quantityBefore,
        quantityAfter,
        notes: dto.notes,
        referenceId: dto.referenceId,
        referenceType: dto.referenceType,
        performedById: userId,
      });
      savedTransaction = await manager.save(transaction);
    });

    // Emit real-time update AFTER transaction commits
    try {
      const product = await this.dataSource
        .getRepository('Product')
        .findOne({ where: { id: dto.productId } });

      this.realtimeService.emitInventoryUpdate(organizationId, {
        productId: dto.productId,
        warehouseId: dto.warehouseId,
        productName: (product as any)?.name || 'Unknown',
        quantityBefore,
        quantityAfter,
        transactionType: dto.transactionType,
        organizationId,
      });
    } catch (e) {
      // Never let WebSocket emission crash the main flow
    }

    return { quantityBefore, quantityAfter, transaction: savedTransaction! };
  }

  async getTransactionHistory(
    organizationId: string,
    productId: string,
    limit = 50,
  ) {
    return this.transactionRepository.find({
      where: { organizationId, productId },
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['performedBy', 'warehouse'],
    });
  }

  async getOrCreateInventory(
    organizationId: string,
    productId: string,
    warehouseId: string,
  ): Promise<Inventory> {
    let inventory = await this.inventoryRepository.findOne({
      where: { organizationId, productId, warehouseId },
    });

    if (!inventory) {
      inventory = this.inventoryRepository.create({
        organizationId,
        productId,
        warehouseId,
        quantityOnHand: 0,
      });
      inventory = await this.inventoryRepository.save(inventory);
    }

    return inventory;
  }
}
