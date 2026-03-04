import {
  Injectable,
  UnauthorizedException,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupplierUser } from '../entities/supplier-user.entity';

@Injectable()
export class SupplierJwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(SupplierUser)
    private supplierUserRepo: Repository<SupplierUser>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) throw new UnauthorizedException();

    const token = authHeader.split(' ')[1];
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
      });
      if (payload.type !== 'supplier') throw new UnauthorizedException();
      const user = await this.supplierUserRepo.findOne({
        where: { id: payload.sub, isActive: true },
      });
      if (!user) throw new UnauthorizedException();
      request.supplierUser = user;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
