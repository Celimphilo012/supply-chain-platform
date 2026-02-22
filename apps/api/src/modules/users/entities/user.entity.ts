// apps/api/src/modules/users/entities/user.entity.ts
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Organization } from '../../organizations/entities/organization.entity';

export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MANAGER = 'manager',
  VIEWER = 'viewer',
}

@Entity('users')
export class User extends BaseEntity {
  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ name: 'password_hash', length: 255 })
  @Exclude() // Never include in API responses
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.VIEWER,
  })
  role: UserRole;

  @Column({ name: 'first_name', length: 100, nullable: true })
  firstName: string;

  @Column({ name: 'last_name', length: 100, nullable: true })
  lastName: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt: Date;
}
