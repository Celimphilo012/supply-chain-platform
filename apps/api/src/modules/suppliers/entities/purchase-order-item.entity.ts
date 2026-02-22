// apps/api/src/modules/suppliers/entities/purchase-order-item.entity.ts
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PurchaseOrder } from './purchase-order.entity';
import { Product } from '../../inventory/entities/product.entity';

@Entity('purchase_order_items')
export class PurchaseOrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'purchase_order_id' })
  purchaseOrderId: string;

  @ManyToOne(() => PurchaseOrder, (po) => po.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'purchase_order_id' })
  purchaseOrder: PurchaseOrder;

  @Column({ name: 'product_id' })
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'quantity_ordered', type: 'int' })
  quantityOrdered: number;

  @Column({ name: 'quantity_received', type: 'int', default: 0 })
  quantityReceived: number;

  @Column({ name: 'unit_cost', type: 'numeric', precision: 10, scale: 4 })
  unitCost: number;
}
