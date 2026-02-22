// apps/api/src/modules/inventory/entities/product.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Category } from './category.entity';

@Entity('products')
export class Product extends BaseEntity {
  @Column({ name: 'organization_id' })
  organizationId: string;

  @Column({ name: 'category_id', nullable: true })
  categoryId: string;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ length: 100 })
  sku: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'unit_of_measure', length: 50, default: 'units' })
  unitOfMeasure: string;

  @Column({
    name: 'unit_cost',
    type: 'numeric',
    precision: 10,
    scale: 4,
    nullable: true,
  })
  unitCost: number;

  @Column({
    name: 'selling_price',
    type: 'numeric',
    precision: 10,
    scale: 4,
    nullable: true,
  })
  sellingPrice: number;

  @Column({
    name: 'weight_kg',
    type: 'numeric',
    precision: 8,
    scale: 3,
    nullable: true,
  })
  weightKg: number;

  @Column({ type: 'jsonb', nullable: true })
  dimensions: Record<string, any>;

  @Column({ type: 'text', array: true, default: [] })
  tags: string[];

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;
}
