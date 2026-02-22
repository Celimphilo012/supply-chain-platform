// apps/api/src/modules/suppliers/entities/supplier.entity.ts
import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('suppliers')
export class Supplier extends BaseEntity {
  @Column({ name: 'organization_id' })
  organizationId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ name: 'contact_name', length: 255, nullable: true })
  contactName: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ length: 50, nullable: true })
  phone: string;

  @Column({ type: 'jsonb', nullable: true })
  address: Record<string, any>;

  @Column({ name: 'payment_terms', type: 'int', default: 30 })
  paymentTerms: number;

  @Column({ name: 'lead_time_days', type: 'int', nullable: true })
  leadTimeDays: number;

  @Column({
    name: 'reliability_score',
    type: 'numeric',
    precision: 3,
    scale: 2,
    nullable: true,
  })
  reliabilityScore: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;
}
