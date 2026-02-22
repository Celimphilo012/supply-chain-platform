// apps/api/src/modules/inventory/entities/category.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('categories')
export class Category extends BaseEntity {
  @Column({ name: 'organization_id' })
  organizationId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ name: 'parent_id', nullable: true })
  parentId: string;

  @ManyToOne(() => Category, (cat) => cat.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: Category;

  @OneToMany(() => Category, (cat) => cat.parent)
  children: Category[];
}
