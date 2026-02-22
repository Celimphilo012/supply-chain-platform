// apps/api/src/modules/suppliers/entities/purchase-order.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Supplier } from './supplier.entity';
import { Warehouse } from '../../inventory/entities/warehouse.entity';
import { User } from '../../users/entities/user.entity';
import { PurchaseOrderItem } from './purchase-order-item.entity';

export enum POStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  SENT = 'sent',
  PARTIAL = 'partial',
  RECEIVED = 'received',
  CANCELLED = 'cancelled',
}

@Entity('purchase_orders')
export class PurchaseOrder extends BaseEntity {
  @Column({ name: 'organization_id' })
  organizationId: string;

  @Column({ name: 'supplier_id' })
  supplierId: string;

  @ManyToOne(() => Supplier)
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @Column({ name: 'warehouse_id' })
  warehouseId: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column({ name: 'po_number', length: 100, unique: true })
  poNumber: string;

  @Column({ type: 'enum', enum: POStatus, default: POStatus.DRAFT })
  status: POStatus;

  @Column({
    name: 'total_amount',
    type: 'numeric',
    precision: 12,
    scale: 4,
    nullable: true,
  })
  totalAmount: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  @Column({ name: 'expected_delivery_date', type: 'date', nullable: true })
  expectedDeliveryDate: Date;

  @Column({ name: 'actual_delivery_date', type: 'date', nullable: true })
  actualDeliveryDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'approved_by', nullable: true })
  approvedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approvedBy: User;

  @Column({ name: 'approved_at', type: 'timestamptz', nullable: true })
  approvedAt: Date;

  @Column({ name: 'created_by', nullable: true })
  createdById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @OneToMany(() => PurchaseOrderItem, (item) => item.purchaseOrder, {
    cascade: true,
  })
  items: PurchaseOrderItem[];
}
