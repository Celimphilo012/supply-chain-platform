// apps/api/src/modules/inventory/services/products.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Product } from '../entities/product.entity';
import { Inventory } from '../entities/inventory.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductQueryDto } from '../dto/product-query.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
  ) {}

  async create(
    organizationId: string,
    dto: CreateProductDto,
  ): Promise<Product> {
    // Check SKU uniqueness within org
    const existing = await this.productRepository.findOne({
      where: { organizationId, sku: dto.sku },
    });
    if (existing)
      throw new ConflictException(`SKU "${dto.sku}" already exists`);

    const product = this.productRepository.create({
      ...dto,
      organizationId,
    });
    return this.productRepository.save(product);
  }

  async findAll(organizationId: string, query: ProductQueryDto) {
    const qb = this.productRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'category')
      .where('p.organization_id = :organizationId', { organizationId });

    // Filter by active status (default: active only)
    if (query.isActive !== undefined) {
      qb.andWhere('p.is_active = :isActive', { isActive: query.isActive });
    } else {
      qb.andWhere('p.is_active = true');
    }

    // Full-text search
    if (query.search) {
      qb.andWhere(
        `to_tsvector('english', p.name || ' ' || COALESCE(p.description, '') || ' ' || p.sku) 
         @@ plainto_tsquery('english', :search)`,
        { search: query.search },
      );
    }

    // Category filter
    if (query.categoryId) {
      qb.andWhere('p.category_id = :categoryId', {
        categoryId: query.categoryId,
      });
    }

    // Cursor-based pagination
    if (query.cursor) {
      qb.andWhere('p.id > :cursor', { cursor: query.cursor });
    }

    const limit = query.limit || 20;
    qb.orderBy('p.id', 'ASC').take(limit + 1);

    const products = await qb.getMany();

    // Determine if there's a next page
    const hasNextPage = products.length > limit;
    if (hasNextPage) products.pop();

    return {
      data: products,
      nextCursor: hasNextPage ? products[products.length - 1]?.id : null,
      hasNextPage,
    };
  }

  async findOne(organizationId: string, id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id, organizationId },
      relations: ['category'],
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(
    organizationId: string,
    id: string,
    dto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(organizationId, id);

    // If SKU is changing, check uniqueness
    if (dto.sku && dto.sku !== product.sku) {
      const existing = await this.productRepository.findOne({
        where: { organizationId, sku: dto.sku },
      });
      if (existing)
        throw new ConflictException(`SKU "${dto.sku}" already exists`);
    }

    Object.assign(product, dto);
    return this.productRepository.save(product);
  }

  async remove(organizationId: string, id: string): Promise<void> {
    const product = await this.findOne(organizationId, id);
    // Soft delete — never hard delete products
    product.isActive = false;
    await this.productRepository.save(product);
  }
}
