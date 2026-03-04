import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Supplier } from '../../suppliers/entities/supplier.entity';
import { Organization } from '../../organizations/entities/organization.entity';
import { SupplierUser } from './supplier-user.entity';

@Entity('supplier_invites')
export class SupplierInvite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'supplier_id' })
  supplierId: string;

  @ManyToOne(() => Supplier)
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 255, unique: true })
  token: string;

  @Column({ default: false })
  accepted: boolean;

  @Column({ name: 'supplier_user_id', nullable: true })
  supplierUserId: string;

  @ManyToOne(() => SupplierUser, { nullable: true })
  @JoinColumn({ name: 'supplier_user_id' })
  supplierUser: SupplierUser;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
