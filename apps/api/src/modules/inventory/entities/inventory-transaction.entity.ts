// apps/api/src/modules/inventory/entities/inventory-transaction.entity.ts
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { Warehouse } from './warehouse.entity';
import { User } from '../../users/entities/user.entity';

export enum TransactionType {
  RECEIPT = 'receipt',
  SALE = 'sale',
  ADJUSTMENT = 'adjustment',
  TRANSFER_IN = 'transfer_in',
  TRANSFER_OUT = 'transfer_out',
  RETURN = 'return',
  WRITE_OFF = 'write_off',
}

@Entity('inventory_transactions')
export class InventoryTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @Column({ name: 'transaction_type', type: 'enum', enum: TransactionType })
  transactionType: TransactionType;

  @Column({ name: 'quantity_delta', type: 'int' })
  quantityDelta: number;

  @Column({ name: 'quantity_before', type: 'int' })
  quantityBefore: number;

  @Column({ name: 'quantity_after', type: 'int' })
  quantityAfter: number;

  @Column({ name: 'reference_id', nullable: true })
  referenceId: string;

  @Column({ name: 'reference_type', length: 50, nullable: true })
  referenceType: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'performed_by', nullable: true })
  performedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'performed_by' })
  performedBy: User;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
