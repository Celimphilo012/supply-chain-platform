import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SupplierUser } from './supplier-user.entity';

@Entity('supplier_catalogue_items')
export class SupplierCatalogueItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'supplier_user_id' })
  supplierUserId: string;

  @ManyToOne(() => SupplierUser)
  @JoinColumn({ name: 'supplier_user_id' })
  supplierUser: SupplierUser;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 100, nullable: true })
  sku: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'unit_cost', type: 'numeric', precision: 12, scale: 4 })
  unitCost: number;

  @Column({ length: 50, nullable: true })
  unit: string;

  @Column({ name: 'minimum_order_quantity', type: 'int', default: 1 })
  minimumOrderQuantity: number;

  @Column({ name: 'lead_time_days', type: 'int', nullable: true })
  leadTimeDays: number;

  @Column({ name: 'is_preferred', default: false })
  isPreferred: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
