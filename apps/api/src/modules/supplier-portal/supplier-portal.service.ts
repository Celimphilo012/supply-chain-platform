import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Resend } from 'resend';
import { SupplierUser } from './entities/supplier-user.entity';
import { SupplierInvite } from './entities/supplier-invite.entity';
import { SupplierUserOrg } from './entities/supplier-user-org.entity';
import { SupplierNotification } from './entities/supplier-notification.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { SupplierProduct } from '../suppliers/entities/supplier-product.entity';
import {
  PurchaseOrder,
  POStatus,
} from '../suppliers/entities/purchase-order.entity';
import { User } from '../users/entities/user.entity';
import { Organization } from '../organizations/entities/organization.entity';
import {
  InviteSupplierDto,
  AcceptInviteDto,
  SupplierLoginDto,
  UpsertCatalogueItemDto,
  AcknowledgePODto,
  CreateCatalogueItemDto,
} from './dto/supplier-portal.dto';
import { SupplierCatalogueItem } from './entities/supplier-catalogue-item.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class SupplierPortalService {
  private resend: Resend;

  constructor(
    @InjectRepository(SupplierUser)
    private supplierUserRepo: Repository<SupplierUser>,
    @InjectRepository(SupplierInvite)
    private inviteRepo: Repository<SupplierInvite>,
    @InjectRepository(SupplierUserOrg)
    private supplierUserOrgRepo: Repository<SupplierUserOrg>,
    @InjectRepository(SupplierNotification)
    private notificationRepo: Repository<SupplierNotification>,
    @InjectRepository(Supplier)
    private supplierRepo: Repository<Supplier>,
    @InjectRepository(SupplierProduct)
    private supplierProductRepo: Repository<SupplierProduct>,
    @InjectRepository(PurchaseOrder)
    private poRepo: Repository<PurchaseOrder>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Organization)
    private orgRepo: Repository<Organization>,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(SupplierCatalogueItem)
    private catalogueItemRepo: Repository<SupplierCatalogueItem>,
    private notificationsService: NotificationsService,
  ) {
    this.resend = new Resend(this.configService.get('RESEND_API_KEY'));
  }

  // ── Invite ─────────────────────────────────────────────────────────────────

  async inviteSupplier(organizationId: string, dto: InviteSupplierDto) {
    const supplier = await this.supplierRepo.findOne({
      where: { id: dto.supplierId, organizationId },
    });
    if (!supplier) throw new NotFoundException('Supplier not found');

    const org = await this.orgRepo.findOne({ where: { id: organizationId } });
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invite = this.inviteRepo.create({
      supplierId: dto.supplierId,
      organizationId,
      email: dto.email,
      token,
      expiresAt,
    });
    await this.inviteRepo.save(invite);

    const appUrl = this.configService.get('APP_URL') ?? 'http://localhost:3000';
    const inviteUrl = `${appUrl}/supplier-portal/accept-invite?token=${token}`;
    const fromEmail =
      this.configService.get('INVITE_FROM_EMAIL') ?? 'onboarding@resend.dev';

    await this.resend.emails.send({
      from: fromEmail,
      to: dto.email,
      subject: `You've been invited to the Supply Chain Portal by ${org?.name}`,
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px;">
          <h2 style="color:#0f172a;">You're invited!</h2>
          <p style="color:#475569;"><strong>${org?.name}</strong> has invited you to manage your supply relationship via the Supplier Portal.</p>
          <p style="color:#475569;">As <strong>${supplier.name}</strong>, you'll be able to:</p>
          <ul style="color:#475569;">
            <li>View and acknowledge purchase orders</li>
            <li>Manage your product catalogue</li>
            <li>Receive notifications for new orders</li>
          </ul>
          <a href="${inviteUrl}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#e11d48;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;">
            Accept Invitation
          </a>
          <p style="color:#94a3b8;font-size:12px;margin-top:24px;">This link expires in 7 days.</p>
        </div>
      `,
    });

    return { message: 'Invitation sent successfully' };
  }

  // ── Accept invite ──────────────────────────────────────────────────────────

  async acceptInvite(dto: AcceptInviteDto) {
    const invite = await this.inviteRepo.findOne({
      where: { token: dto.token, accepted: false },
      relations: ['supplier', 'organization'],
    });
    if (!invite)
      throw new BadRequestException('Invalid or already used invite token');
    if (invite.expiresAt < new Date())
      throw new BadRequestException('Invite token has expired');

    let supplierUser = await this.supplierUserRepo.findOne({
      where: { email: invite.email },
    });
    if (!supplierUser) {
      const passwordHash = await bcrypt.hash(dto.password, 12);
      supplierUser = this.supplierUserRepo.create({
        email: invite.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
      });
      supplierUser = await this.supplierUserRepo.save(supplierUser);
    }

    const existing = await this.supplierUserOrgRepo.findOne({
      where: {
        supplierUserOrId: supplierUser.id,
        supplierId: invite.supplierId,
      },
    });
    if (!existing) {
      const link = this.supplierUserOrgRepo.create({
        supplierUserOrId: supplierUser.id,
        supplierId: invite.supplierId,
        organizationId: invite.organizationId,
      });
      await this.supplierUserOrgRepo.save(link);
    }

    await this.inviteRepo.update(invite.id, {
      accepted: true,
      supplierUserId: supplierUser.id,
    });

    const token = await this.generateToken(supplierUser);
    return { accessToken: token, user: this.sanitize(supplierUser) };
  }

  // ── Login ──────────────────────────────────────────────────────────────────

  async login(dto: SupplierLoginDto) {
    const user = await this.supplierUserRepo.findOne({
      where: { email: dto.email, isActive: true },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    await this.supplierUserRepo.update(user.id, { lastLoginAt: new Date() });
    const token = await this.generateToken(user);
    return { accessToken: token, user: this.sanitize(user) };
  }

  // ── Portal dashboard ───────────────────────────────────────────────────────

  async getPortal(supplierUserId: string) {
    const links = await this.supplierUserOrgRepo.find({
      where: { supplierUserOrId: supplierUserId },
      relations: ['supplier', 'organization'],
    });

    return Promise.all(
      links.map(async (link) => {
        const orders = await this.poRepo.find({
          where: {
            supplierId: link.supplierId,
            organizationId: link.organizationId,
          },
          relations: ['items', 'items.product', 'warehouse'],
          order: { createdAt: 'DESC' },
          take: 20,
        });
        return {
          supplier: link.supplier,
          organization: {
            id: link.organization.id,
            name: link.organization.name,
          },
          recentOrders: orders,
        };
      }),
    );
  }

  // ── PO Acknowledgement ─────────────────────────────────────────────────────

  async acknowledgePO(
    supplierUserId: string,
    poId: string,
    dto: AcknowledgePODto,
  ) {
    // verify this supplier user has access to this PO
    const links = await this.supplierUserOrgRepo.find({
      where: { supplierUserOrId: supplierUserId },
    });
    const supplierIds = links.map((l) => l.supplierId);

    const po = await this.poRepo.findOne({
      where: { id: poId },
      relations: ['supplier', 'items', 'items.product'],
    });
    if (!po || !supplierIds.includes(po.supplierId))
      throw new NotFoundException('Purchase order not found');
    if (po.status !== POStatus.SENT)
      throw new BadRequestException('Only sent POs can be acknowledged');

    const newStatus =
      dto.action === 'confirm' ? POStatus.CONFIRMED : POStatus.REJECTED;
    await this.poRepo.update(poId, { status: newStatus });

    const supplierUser = await this.supplierUserRepo.findOne({
      where: { id: supplierUserId },
    });

    await this.notificationsService.createForOrg({
      organizationId: po.organizationId,
      type: dto.action === 'confirm' ? 'po_confirmed' : 'po_rejected',
      title: `PO ${po.poNumber} ${dto.action === 'confirm' ? 'Confirmed' : 'Rejected'}`,
      message: `${supplierUser?.firstName} ${supplierUser?.lastName} from ${po.supplier?.name} has ${dto.action === 'confirm' ? 'confirmed' : 'rejected'} purchase order ${po.poNumber}${dto.notes ? `: "${dto.notes}"` : '.'}`,
      data: { poId: po.id, poNumber: po.poNumber, action: dto.action },
    });

    // notify org users via email
    const orgUsers = await this.userRepo.find({
      where: { organizationId: po.organizationId, isActive: true },
    });
    const fromEmail =
      this.configService.get('INVITE_FROM_EMAIL') ?? 'onboarding@resend.dev';
    const appUrl = this.configService.get('APP_URL') ?? 'http://localhost:3000';

    const actionLabel = dto.action === 'confirm' ? 'confirmed' : 'rejected';
    const actionColor = dto.action === 'confirm' ? '#16a34a' : '#e11d48';

    for (const orgUser of orgUsers) {
      if (!orgUser.email) continue;
      await this.resend.emails
        .send({
          from: fromEmail,
          to: orgUser.email,
          subject: `PO ${po.poNumber} has been ${actionLabel} by ${po.supplier.name}`,
          html: `
          <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px;">
            <h2 style="color:#0f172a;">Purchase Order ${actionLabel.charAt(0).toUpperCase() + actionLabel.slice(1)}</h2>
            <p style="color:#475569;">
              <strong>${po.supplier.name}</strong> has <strong style="color:${actionColor}">${actionLabel}</strong> 
              purchase order <strong>${po.poNumber}</strong>.
            </p>
            ${dto.notes ? `<p style="color:#475569;"><strong>Note from supplier:</strong> ${dto.notes}</p>` : ''}
            <a href="${appUrl}/dashboard/purchase-orders" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#0f172a;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;">
              View Purchase Orders
            </a>
          </div>
        `,
        })
        .catch(() => {});
    }

    // create in-app notification for supplier
    await this.notificationRepo.save(
      this.notificationRepo.create({
        supplierUserId,
        type: `po_${actionLabel}`,
        title: `PO ${po.poNumber} ${actionLabel}`,
        message: `You have ${actionLabel} purchase order ${po.poNumber}${dto.notes ? `: "${dto.notes}"` : '.'}`,
        data: { poId, poNumber: po.poNumber },
      }),
    );

    return { message: `PO ${actionLabel} successfully`, status: newStatus };
  }
  async getCatalogueBySupplier(supplierId: string) {
    const links = await this.supplierUserOrgRepo.find({
      where: { supplierId },
    });
    if (!links.length) return [];
    const supplierUserIds = links.map((l) => l.supplierUserOrId);
    return this.catalogueItemRepo.find({
      where: supplierUserIds.map((id) => ({ supplierUserId: id })),
      order: { isPreferred: 'DESC', name: 'ASC' },
    });
  }

  // ── Notify supplier when PO is sent ───────────────────────────────────────

  async notifySupplierOfNewPO(po: PurchaseOrder) {
    const links = await this.supplierUserOrgRepo.find({
      where: { supplierId: po.supplierId, organizationId: po.organizationId },
    });
    if (!links.length) return;

    const org = await this.orgRepo.findOne({
      where: { id: po.organizationId },
    });
    const fromEmail =
      this.configService.get('INVITE_FROM_EMAIL') ?? 'onboarding@resend.dev';
    const appUrl = this.configService.get('APP_URL') ?? 'http://localhost:3000';

    for (const link of links) {
      const supplierUser = await this.supplierUserRepo.findOne({
        where: { id: link.supplierUserOrId },
      });
      if (!supplierUser) continue;

      // in-app notification
      await this.notificationRepo.save(
        this.notificationRepo.create({
          supplierUserId: supplierUser.id,
          type: 'new_po',
          title: `New Purchase Order: ${po.poNumber}`,
          message: `${org?.name} has sent you a new purchase order ${po.poNumber} requiring your confirmation.`,
          data: { poId: po.id, poNumber: po.poNumber },
        }),
      );

      // email notification
      await this.resend.emails
        .send({
          from: fromEmail,
          to: supplierUser.email,
          subject: `New Purchase Order ${po.poNumber} from ${org?.name}`,
          html: `
          <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px;">
            <h2 style="color:#0f172a;">New Purchase Order</h2>
            <p style="color:#475569;"><strong>${org?.name}</strong> has sent you purchase order <strong>${po.poNumber}</strong>.</p>
            <p style="color:#475569;">Total: <strong>${po.currency} ${parseFloat(po.totalAmount?.toString() ?? '0').toLocaleString()}</strong></p>
            ${po.expectedDeliveryDate ? `<p style="color:#475569;">Expected delivery: <strong>${new Date(po.expectedDeliveryDate).toLocaleDateString()}</strong></p>` : ''}
            <a href="${appUrl}/supplier-portal/dashboard" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#e11d48;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;">
              View & Confirm Order
            </a>
          </div>
        `,
        })
        .catch(() => {});
    }
  }

  // ── Catalogue ──────────────────────────────────────────────────────────────

  async getCatalogue(supplierUserId: string) {
    return this.catalogueItemRepo.find({
      where: { supplierUserId },
      order: { createdAt: 'DESC' },
    });
  }

  async createCatalogueItem(
    supplierUserId: string,
    dto: CreateCatalogueItemDto,
  ) {
    const item = this.catalogueItemRepo.create({ supplierUserId, ...dto });
    return this.catalogueItemRepo.save(item);
  }

  async updateCatalogueItem(
    supplierUserId: string,
    id: string,
    dto: CreateCatalogueItemDto,
  ) {
    const item = await this.catalogueItemRepo.findOne({
      where: { id, supplierUserId },
    });
    if (!item) throw new NotFoundException('Item not found');
    await this.catalogueItemRepo.update(id, dto);
    return this.catalogueItemRepo.findOne({ where: { id } });
  }

  async deleteCatalogueItem(supplierUserId: string, id: string) {
    const item = await this.catalogueItemRepo.findOne({
      where: { id, supplierUserId },
    });
    if (!item) throw new NotFoundException('Item not found');
    await this.catalogueItemRepo.delete(id);
    return { message: 'Item deleted' };
  }

  async upsertCatalogueItem(
    supplierUserId: string,
    dto: UpsertCatalogueItemDto,
  ) {
    const links = await this.supplierUserOrgRepo.find({
      where: { supplierUserOrId: supplierUserId },
    });
    const link = links.find((l) => l.supplierId === dto.supplierId);
    if (!link)
      throw new BadRequestException('You do not have access to this supplier');

    const existing = await this.supplierProductRepo.findOne({
      where: {
        supplierId: dto.supplierId,
        productId: dto.productId,
        organizationId: link.organizationId,
      },
    });

    if (existing) {
      await this.supplierProductRepo.update(existing.id, {
        unitCost: dto.unitCost,
        minimumOrderQuantity: dto.minimumOrderQuantity ?? 1,
        leadTimeDays: dto.leadTimeDays,
        isPreferred: dto.isPreferred ?? false,
      });
      return this.supplierProductRepo.findOne({
        where: { id: existing.id },
        relations: ['product'],
      });
    }

    const item = this.supplierProductRepo.create({
      supplierId: dto.supplierId,
      productId: dto.productId,
      organizationId: link.organizationId,
      unitCost: dto.unitCost,
      minimumOrderQuantity: dto.minimumOrderQuantity ?? 1,
      leadTimeDays: dto.leadTimeDays,
      isPreferred: dto.isPreferred ?? false,
    });
    return this.supplierProductRepo.save(item);
  }

  // ── Notifications ──────────────────────────────────────────────────────────

  async getNotifications(supplierUserId: string) {
    return this.notificationRepo.find({
      where: { supplierUserId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async markNotificationsRead(supplierUserId: string) {
    await this.notificationRepo.update(
      { supplierUserId, isRead: false },
      { isRead: true },
    );
    return { message: 'Notifications marked as read' };
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private async generateToken(user: SupplierUser) {
    return this.jwtService.signAsync(
      { sub: user.id, email: user.email, type: 'supplier' },
      { secret: this.configService.get('JWT_ACCESS_SECRET'), expiresIn: '24h' },
    );
  }

  private sanitize(user: SupplierUser) {
    const { passwordHash, ...safe } = user as any;
    return safe;
  }
}
