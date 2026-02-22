// apps/api/src/modules/inventory/entities/inventory.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, Check } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Product } from './product.entity';
import { Warehouse } from './warehouse.entity';

@Entity('inventory')
@Check(`"quantity_on_hand" >= 0`)
export class Inventory extends BaseEntity {
  @Column({ name: 'organization_id' })
  organizationId: string;

  @Column({ name: 'product_id' })
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'warehouse_id' })
  warehouseId: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column({ name: 'quantity_on_hand', type: 'int', default: 0 })
  quantityOnHand: number;

  @Column({ name: 'quantity_reserved', type: 'int', default: 0 })
  quantityReserved: number;

  @Column({ name: 'quantity_incoming', type: 'int', default: 0 })
  quantityIncoming: number;

  @Column({ name: 'reorder_point', type: 'int', nullable: true })
  reorderPoint: number;

  @Column({ name: 'reorder_quantity', type: 'int', nullable: true })
  reorderQuantity: number;

  @Column({ name: 'max_stock_level', type: 'int', nullable: true })
  maxStockLevel: number;

  @Column({ name: 'last_counted_at', type: 'timestamptz', nullable: true })
  lastCountedAt: Date;

  //   @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  //   updatedAt: Date;
}
