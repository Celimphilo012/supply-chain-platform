// apps/api/src/modules/auth/auth.controller.ts
import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { Patch } from '@nestjs/common'; // add Patch to existing import
import { UpdateProfileDto, ChangePasswordDto } from './dto/update-profile.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 registrations/min
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto);
    this.setRefreshTokenCookie(res, result.refreshToken);
    const { refreshToken, ...response } = result;
    return response;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 attempts/min
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    this.setRefreshTokenCookie(res, result.refreshToken);
    const { refreshToken, ...response } = result;
    return response;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshAuthGuard)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: any,
  ) {
    const rawToken = req.cookies?.['refresh_token'];
    const tokens = await this.authService.refresh(user.sub, rawToken);
    this.setRefreshTokenCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: User,
  ) {
    const rawToken = req.cookies?.['refresh_token'];
    if (rawToken) {
      await this.authService.logout(user.id, rawToken);
    }
    res.clearCookie('refresh_token');
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: User) {
    return user;
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateProfile(@CurrentUser() user: User, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(user.id, dto);
  }

  @Patch('me/password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  changePassword(@CurrentUser() user: User, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(user.id, dto);
  }

  // ─── Helper ────────────────────────────────────────────────

  private setRefreshTokenCookie(res: Response, token: string) {
    res.cookie('refresh_token', token, {
      httpOnly: true, // JS cannot read this cookie — XSS protection
      secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
      path: '/api/v1/auth', // Cookie only sent to auth routes
    });
  }
}
