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
import { Supplier } from '../suppliers/entities/supplier.entity';
import { PurchaseOrder } from '../suppliers/entities/purchase-order.entity';
import {
  InviteSupplierDto,
  AcceptInviteDto,
  SupplierLoginDto,
} from './dto/supplier-portal.dto';

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
    @InjectRepository(Supplier)
    private supplierRepo: Repository<Supplier>,
    @InjectRepository(PurchaseOrder)
    private poRepo: Repository<PurchaseOrder>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.resend = new Resend(this.configService.get('RESEND_API_KEY'));
  }

  async inviteSupplier(organizationId: string, dto: InviteSupplierDto) {
    const supplier = await this.supplierRepo.findOne({
      where: { id: dto.supplierId, organizationId },
    });
    if (!supplier) throw new NotFoundException('Supplier not found');

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
      subject: `You've been invited to the Supply Chain Portal`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 32px;">
          <h2 style="color: #0f172a;">You're invited!</h2>
          <p style="color: #475569;">
            <strong>${supplier.name}</strong> has been added as a supplier and you've been invited 
            to manage your products and view purchase orders.
          </p>
          <a href="${inviteUrl}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#e11d48;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;">
            Accept Invitation
          </a>
          <p style="color:#94a3b8;font-size:12px;margin-top:24px;">This link expires in 7 days.</p>
        </div>
      `,
    });

    return { message: 'Invitation sent successfully' };
  }

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

    // link supplier user to this org+supplier
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

  async getPortal(supplierUserId: string) {
    const links = await this.supplierUserOrgRepo.find({
      where: { supplierUserOrId: supplierUserId },
      relations: ['supplier', 'organization'],
    });

    const result = await Promise.all(
      links.map(async (link) => {
        const orders = await this.poRepo.find({
          where: {
            supplierId: link.supplierId,
            organizationId: link.organizationId,
          },
          relations: ['items', 'items.product', 'warehouse'],
          order: { createdAt: 'DESC' },
          take: 10,
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

    return result;
  }

  private async generateToken(user: SupplierUser) {
    return this.jwtService.signAsync(
      { sub: user.id, email: user.email, type: 'supplier' },
      {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: '24h',
      },
    );
  }

  private sanitize(user: SupplierUser) {
    const { passwordHash, ...safe } = user as any;
    return safe;
  }
}
