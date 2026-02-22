// apps/api/src/modules/inventory/services/warehouses.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from '../entities/warehouse.entity';
import { CreateWarehouseDto } from '../dto/create-warehouse.dto';

@Injectable()
export class WarehousesService {
  constructor(
    @InjectRepository(Warehouse)
    private warehouseRepository: Repository<Warehouse>,
  ) {}

  async create(
    organizationId: string,
    dto: CreateWarehouseDto,
  ): Promise<Warehouse> {
    const warehouse = this.warehouseRepository.create({
      ...dto,
      organizationId,
    });
    return this.warehouseRepository.save(warehouse);
  }

  async findAll(organizationId: string): Promise<Warehouse[]> {
    return this.warehouseRepository.find({
      where: { organizationId, isActive: true },
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(organizationId: string, id: string): Promise<Warehouse> {
    const warehouse = await this.warehouseRepository.findOne({
      where: { id, organizationId },
    });
    if (!warehouse) throw new NotFoundException('Warehouse not found');
    return warehouse;
  }

  async update(
    organizationId: string,
    id: string,
    dto: Partial<CreateWarehouseDto>,
  ): Promise<Warehouse> {
    const warehouse = await this.findOne(organizationId, id);
    Object.assign(warehouse, dto);
    return this.warehouseRepository.save(warehouse);
  }
}
