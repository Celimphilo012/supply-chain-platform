// apps/api/src/modules/admin/admin.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Organization } from '../organizations/entities/organization.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { PurchaseOrder } from '../suppliers/entities/purchase-order.entity';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  CreateAdminUserDto,
  UpdateUserDto,
} from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Organization)
    private orgRepo: Repository<Organization>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Inventory)
    private inventoryRepo: Repository<Inventory>,
    @InjectRepository(Supplier)
    private supplierRepo: Repository<Supplier>,
    @InjectRepository(PurchaseOrder)
    private poRepo: Repository<PurchaseOrder>,
  ) {}

  // ── Platform Stats ──────────────────────────────────────────────────────

  async getStats() {
    const [totalOrgs, totalUsers, totalProducts, totalOrders] =
      await Promise.all([
        this.orgRepo.count(),
        this.userRepo.count(),
        this.inventoryRepo.count(),
        this.poRepo.count(),
      ]);

    const activeUsers = await this.userRepo.count({
      where: { isActive: true },
    });
    const totalValue = await this.inventoryRepo
      .createQueryBuilder('inv')
      .leftJoin('inv.product', 'product')
      .select(
        'SUM(inv.quantityOnHand * COALESCE(product.unitCost, 0))',
        'total',
      )
      .getRawOne();

    const recentOrgs = await this.orgRepo.find({
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      totalOrgs,
      totalUsers,
      activeUsers,
      totalProducts,
      totalOrders,
      totalStockValue: parseFloat(totalValue?.total ?? '0'),
      recentOrgs,
    };
  }

  // ── Organizations ───────────────────────────────────────────────────────

  async getAllOrganizations() {
    return this.orgRepo.find({ order: { createdAt: 'DESC' } });
  }

  async getOrganization(id: string) {
    const org = await this.orgRepo.findOne({ where: { id } });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  async createOrganization(dto: CreateOrganizationDto) {
    const slug = this.generateSlug(dto.name);
    const org = this.orgRepo.create({
      name: dto.name,
      slug,
      plan: dto.plan ?? 'free',
    });
    return this.orgRepo.save(org);
  }

  async updateOrganization(id: string, dto: UpdateOrganizationDto) {
    const org = await this.getOrganization(id);
    Object.assign(org, dto);
    return this.orgRepo.save(org);
  }

  async deleteOrganization(id: string) {
    const org = await this.getOrganization(id);
    await this.orgRepo.remove(org);
    return { message: 'Organization deleted successfully' };
  }

  // ── Users ───────────────────────────────────────────────────────────────

  async getAllUsers() {
    return this.userRepo.find({
      relations: ['organization'],
      order: { createdAt: 'DESC' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        organizationId: true,
        organization: { id: true, name: true, slug: true },
      },
    });
  }

  async getUser(id: string) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['organization'],
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        organizationId: true,
        organization: { id: true, name: true, slug: true },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async createUser(dto: CreateAdminUserDto) {
    const existing = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = this.userRepo.create({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role,
      organizationId: dto.organizationId ?? undefined,
    });
    const saved = await this.userRepo.save(user);
    const { passwordHash: _, ...safe } = saved as any;
    return safe;
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    Object.assign(user, dto);
    const saved = await this.userRepo.save(user);
    const { passwordHash: _, ...safe } = saved as any;
    return safe;
  }

  async deleteUser(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === UserRole.SUPER_ADMIN) {
      throw new ConflictException('Cannot delete a super admin account');
    }
    await this.userRepo.remove(user);
    return { message: 'User deleted successfully' };
  }

  // ── Cross-org read views ────────────────────────────────────────────────

  async getAllInventory() {
    return this.inventoryRepo.find({
      relations: ['product', 'warehouse'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAllSuppliers() {
    return this.supplierRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getAllOrders() {
    return this.poRepo.find({
      relations: ['supplier', 'warehouse', 'items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  private generateSlug(name: string): string {
    return (
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') +
      '-' +
      Math.random().toString(36).substring(2, 7)
    );
  }
}
