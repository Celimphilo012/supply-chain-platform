// apps/api/src/modules/inventory/entities/warehouse.entity.ts
import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('warehouses')
export class Warehouse extends BaseEntity {
  @Column({ name: 'organization_id' })
  organizationId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'jsonb', nullable: true })
  address: Record<string, any>;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
