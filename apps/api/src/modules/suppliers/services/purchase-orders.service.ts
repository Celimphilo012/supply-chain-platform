// apps/api/src/modules/suppliers/services/purchase-orders.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PurchaseOrder, POStatus } from '../entities/purchase-order.entity';
import { PurchaseOrderItem } from '../entities/purchase-order-item.entity';
import { CreatePurchaseOrderDto } from '../dto/create-purchase-order.dto';
import { UpdatePOStatusDto } from '../dto/update-po-status.dto';
import { ReceivePODto } from '../dto/receive-po.dto';
import { validateTransition } from '../po-state-machine';
import { InventoryService } from '../../inventory/services/inventory.service';
import { TransactionType } from '../../inventory/entities/inventory-transaction.entity';
import { RealtimeService } from '../../realtime/realtime.service';
import { SupplierPortalService } from '../../supplier-portal/supplier-portal.service';
import { forwardRef, Inject } from '@nestjs/common';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private poRepository: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseOrderItem)
    private poItemRepository: Repository<PurchaseOrderItem>,
    private inventoryService: InventoryService,
    private dataSource: DataSource,
    private realtimeService: RealtimeService,
    @Inject(forwardRef(() => SupplierPortalService))
    private supplierPortalService: SupplierPortalService,
  ) {}

  async create(
    organizationId: string,
    userId: string,
    dto: CreatePurchaseOrderDto,
  ): Promise<PurchaseOrder> {
    const poNumber = this.generatePONumber();

    const totalAmount = dto.items.reduce(
      (sum, item) => sum + item.quantityOrdered * item.unitCost,
      0,
    );

    const po = this.poRepository.create({
      organizationId,
      supplierId: dto.supplierId,
      warehouseId: dto.warehouseId,
      poNumber,
      status: POStatus.DRAFT,
      totalAmount,
      currency: dto.currency || 'USD',
      expectedDeliveryDate: dto.expectedDeliveryDate
        ? new Date(dto.expectedDeliveryDate)
        : undefined,
      notes: dto.notes,
      createdById: userId,
      items: dto.items.map((item) =>
        this.poItemRepository.create({
          productId: item.productId,
          quantityOrdered: item.quantityOrdered,
          unitCost: item.unitCost,
        }),
      ),
    });

    return this.poRepository.save(po);
  }

  async findAll(
    organizationId: string,
    status?: POStatus,
  ): Promise<PurchaseOrder[]> {
    const where: any = { organizationId };
    if (status) where.status = status;

    return this.poRepository.find({
      where,
      relations: ['supplier', 'warehouse', 'items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(organizationId: string, id: string): Promise<PurchaseOrder> {
    const po = await this.poRepository.findOne({
      where: { id, organizationId },
      relations: [
        'supplier',
        'warehouse',
        'items',
        'items.product',
        'createdBy',
        'approvedBy',
      ],
    });
    if (!po) throw new NotFoundException('Purchase order not found');
    return po;
  }

  async updateStatus(
    organizationId: string,
    id: string,
    userId: string,
    dto: UpdatePOStatusDto,
  ): Promise<PurchaseOrder> {
    const po = await this.findOne(organizationId, id);

    // State machine validation — throws if transition is invalid
    validateTransition(po.status, dto.status);

    po.status = dto.status;
    if (dto.notes) po.notes = dto.notes;

    // Record who approved and when
    if (dto.status === POStatus.APPROVED) {
      po.approvedById = userId;
      po.approvedAt = new Date();
    }
    // notify supplier when PO is sent
    if (dto.status === POStatus.SENT) {
      const updatedPO = await this.findOne(organizationId, id);
      this.supplierPortalService
        .notifySupplierOfNewPO(updatedPO)
        .catch(() => {});
    }
    // Emit real-time PO status change
    try {
      this.realtimeService.emitPOStatusChange(organizationId, {
        poId: po.id,
        poNumber: po.poNumber,
        oldStatus: po.status,
        newStatus: dto.status,
        organizationId,
      });
    } catch (e) {}

    return this.poRepository.save(po);
  }

  async receive(
    organizationId: string,
    id: string,
    userId: string,
    dto: ReceivePODto,
  ): Promise<PurchaseOrder> {
    const po = await this.findOne(organizationId, id);

    if (![POStatus.SENT, POStatus.PARTIAL].includes(po.status)) {
      throw new BadRequestException(
        'Can only receive items on POs with status "sent" or "partial"',
      );
    }

    await this.dataSource.transaction(async (manager) => {
      for (const receiveItem of dto.items) {
        const poItem = po.items.find(
          (i) => i.id === receiveItem.purchaseOrderItemId,
        );
        if (!poItem)
          throw new NotFoundException(
            `PO item ${receiveItem.purchaseOrderItemId} not found`,
          );

        const maxReceivable = poItem.quantityOrdered - poItem.quantityReceived;
        if (receiveItem.quantityReceived > maxReceivable) {
          throw new BadRequestException(
            `Cannot receive ${receiveItem.quantityReceived} units for item — max receivable is ${maxReceivable}`,
          );
        }

        // Update received quantity on line item
        await manager.update(PurchaseOrderItem, poItem.id, {
          quantityReceived:
            poItem.quantityReceived + receiveItem.quantityReceived,
        });

        // Add to inventory with audit trail
        if (receiveItem.quantityReceived > 0) {
          await this.inventoryService.adjust(organizationId, userId, {
            productId: poItem.productId,
            warehouseId: po.warehouseId,
            quantityDelta: receiveItem.quantityReceived,
            transactionType: TransactionType.RECEIPT,
            referenceId: po.id,
            referenceType: 'purchase_order',
            notes: `Received against PO ${po.poNumber}`,
          });
        }
      }

      // Determine if fully or partially received
      const updatedPO = await manager.findOne(PurchaseOrder, {
        where: { id },
        relations: ['items'],
      });

      const allReceived = updatedPO!.items.every(
        (i) => i.quantityReceived >= i.quantityOrdered,
      );

      await manager.update(PurchaseOrder, id, {
        status: allReceived ? POStatus.RECEIVED : POStatus.PARTIAL,
        actualDeliveryDate: allReceived ? new Date() : undefined,
      });
    });

    return this.findOne(organizationId, id);
  }

  private generatePONumber(): string {
    const date = new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `PO-${y}${m}${d}-${rand}`;
  }
}
