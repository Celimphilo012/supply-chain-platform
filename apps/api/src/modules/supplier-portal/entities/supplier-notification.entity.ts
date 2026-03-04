import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SupplierUser } from './supplier-user.entity';

@Entity('supplier_notifications')
export class SupplierNotification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'supplier_user_id' })
  supplierUserId: string;

  @ManyToOne(() => SupplierUser)
  @JoinColumn({ name: 'supplier_user_id' })
  supplierUser: SupplierUser;

  @Column({ length: 50 })
  type: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'jsonb', default: {} })
  data: Record<string, any>;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}