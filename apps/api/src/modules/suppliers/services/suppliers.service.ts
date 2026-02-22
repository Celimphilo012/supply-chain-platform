// apps/api/src/modules/suppliers/services/suppliers.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from '../entities/supplier.entity';
import { SupplierProduct } from '../entities/supplier-product.entity';
import { CreateSupplierDto } from '../dto/create-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
    @InjectRepository(SupplierProduct)
    private supplierProductRepository: Repository<SupplierProduct>,
  ) {}

  async create(
    organizationId: string,
    dto: CreateSupplierDto,
  ): Promise<Supplier> {
    const supplier = this.supplierRepository.create({ ...dto, organizationId });
    return this.supplierRepository.save(supplier);
  }

  async findAll(organizationId: string): Promise<Supplier[]> {
    return this.supplierRepository.find({
      where: { organizationId, isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(organizationId: string, id: string): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({
      where: { id, organizationId },
    });
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }

  async update(
    organizationId: string,
    id: string,
    dto: Partial<CreateSupplierDto>,
  ): Promise<Supplier> {
    const supplier = await this.findOne(organizationId, id);
    Object.assign(supplier, dto);
    return this.supplierRepository.save(supplier);
  }

  async addProduct(
    organizationId: string,
    supplierId: string,
    productId: string,
    unitCost: number,
    minimumOrderQuantity = 1,
    isPreferred = false,
  ): Promise<SupplierProduct> {
    const sp = this.supplierProductRepository.create({
      supplierId,
      productId,
      organizationId,
      unitCost,
      minimumOrderQuantity,
      isPreferred,
    });
    return this.supplierProductRepository.save(sp);
  }

  async getProducts(
    organizationId: string,
    supplierId: string,
  ): Promise<SupplierProduct[]> {
    await this.findOne(organizationId, supplierId);
    return this.supplierProductRepository.find({
      where: { supplierId },
      relations: ['product'],
    });
  }
}
