// apps/api/src/modules/auth/auth.service.ts
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserRole } from '../users/entities/user.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto, ChangePasswordDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Organization)
    private orgRepository: Repository<Organization>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private dataSource: DataSource,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const { savedUser, savedOrg } = await this.dataSource.transaction(
      async (manager) => {
        const slug = this.generateSlug(dto.organizationName);
        const org = manager.create(Organization, {
          name: dto.organizationName,
          slug,
        });
        const savedOrg = await manager.save(org);

        const user = manager.create(User, {
          organizationId: savedOrg.id,
          email: dto.email,
          passwordHash,
          role: UserRole.OWNER,
          firstName: dto.firstName,
          lastName: dto.lastName,
        });
        const savedUser = await manager.save(user);
        return { savedUser, savedOrg };
      },
    );

    const tokens = await this.generateTokens(savedUser);
    await this.storeRefreshToken(savedUser.id, tokens.refreshToken);

    return {
      user: this.sanitizeUser(savedUser),
      organization: savedOrg,
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email, isActive: true },
      relations: ['organization'],
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) throw new UnauthorizedException('Invalid credentials');

    await this.userRepository.update(user.id, { lastLoginAt: new Date() });

    const tokens = await this.generateTokens(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      organization: user.organization ?? null, // null-safe for super_admin
      ...tokens,
    };
  }

  async refresh(userId: string, rawRefreshToken: string) {
    const tokenHash = this.hashToken(rawRefreshToken);

    const storedToken = await this.refreshTokenRepository.findOne({
      where: { userId, tokenHash, isRevoked: false },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
    });
    if (!user) throw new UnauthorizedException();

    await this.refreshTokenRepository.update(storedToken.id, {
      isRevoked: true,
    });

    const tokens = await this.generateTokens(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string, rawRefreshToken: string) {
    const tokenHash = this.hashToken(rawRefreshToken);
    await this.refreshTokenRepository.update(
      { userId, tokenHash },
      { isRevoked: true },
    );
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    await this.userRepository.update(userId, {
      firstName: dto.firstName,
      lastName: dto.lastName,
    });
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const { passwordHash, ...safe } = user as any;
    return safe;
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid)
      throw new UnauthorizedException('Current password is incorrect');

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.userRepository.update(userId, { passwordHash });
    return { message: 'Password updated successfully' };
  }

  // ── Private Helpers ───────────────────────────────────────────────────

  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId ?? null, // null-safe for super_admin
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt.accessSecret'),
        expiresIn: this.configService.get('jwt.accessExpiry'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt.refreshSecret'),
        expiresIn: this.configService.get('jwt.refreshExpiry'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(userId: string, rawToken: string) {
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    const token = this.refreshTokenRepository.create({
      userId,
      tokenHash,
      expiresAt,
    });
    await this.refreshTokenRepository.save(token);
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

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

  private sanitizeUser(user: User) {
    const { passwordHash, ...safe } = user as any;
    return safe;
  }
}
