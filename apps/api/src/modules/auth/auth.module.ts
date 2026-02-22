// apps/api/src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshStrategy } from './strategies/refresh.strategy';
import { User } from '../users/entities/user.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { RefreshToken } from './entities/refresh-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Organization, RefreshToken]),
    PassportModule,
    JwtModule.register({}), // Configured per-call in service
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RefreshStrategy],
  exports: [AuthService],
})
export class AuthModule {}
