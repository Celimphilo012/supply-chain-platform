import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SupplierUser } from './supplier-user.entity';
import { Supplier } from '../../suppliers/entities/supplier.entity';
import { Organization } from '../../organizations/entities/organization.entity';

@Entity('supplier_user_orgs')
export class SupplierUserOrg {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'supplier_user_id' })
  supplierUserOrId: string;

  @ManyToOne(() => SupplierUser)
  @JoinColumn({ name: 'supplier_user_id' })
  supplierUser: SupplierUser;

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

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
