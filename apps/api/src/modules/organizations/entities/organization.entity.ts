// apps/api/src/modules/organizations/entities/organization.entity.ts
import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('organizations')
export class Organization extends BaseEntity {
  @Column({ length: 255 })
  name: string;

  @Column({ length: 100, unique: true })
  slug: string;

  @Column({ length: 50, default: 'free' })
  plan: string;

  @Column({ type: 'jsonb', default: {} })
  settings: Record<string, any>;
}
