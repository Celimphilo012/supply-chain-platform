// apps/api/src/modules/suppliers/entities/supplier-product.entity.ts
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { Supplier } from './supplier.entity';
import { Product } from '../../inventory/entities/product.entity';

@Entity('supplier_products')
export class SupplierProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'supplier_id' })
  supplierId: string;

  @ManyToOne(() => Supplier, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @Column({ name: 'product_id' })
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @Column({ name: 'unit_cost', type: 'numeric', precision: 10, scale: 4 })
  unitCost: number;

  @Column({ name: 'minimum_order_quantity', type: 'int', default: 1 })
  minimumOrderQuantity: number;

  @Column({ name: 'lead_time_days', type: 'int', nullable: true })
  leadTimeDays: number;

  @Column({ name: 'is_preferred', default: false })
  isPreferred: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
