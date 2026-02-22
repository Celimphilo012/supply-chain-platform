import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.['refresh_token'] ?? null;
        },
      ]),
      secretOrKey: configService.get<string>('jwt.refreshSecret') as string,
      passReqToCallback: true as true,
    });
  }

  async validate(request: Request, payload: any) {
    const refreshToken = request.cookies?.['refresh_token'];
    if (!refreshToken) throw new UnauthorizedException();
    return { ...payload, refreshToken };
  }
}
