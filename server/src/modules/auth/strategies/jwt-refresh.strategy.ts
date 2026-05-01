import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

export interface RefreshJwtPayload {
  id: string;
  email: string;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.refresh_token ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-key',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: RefreshJwtPayload) {
    return {
      id: payload.id,
      email: payload.email,
      refreshToken: req.cookies?.refresh_token as string,
    };
  }
}
