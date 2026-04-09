import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service.js';
import type { JwtPayload } from './types/jwt-payload.type.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request) => request?.cookies?.accessToken ?? null
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET')
    });
  }

  validate(payload: JwtPayload) {
    return this.authService.validateJwtPayload(payload);
  }
}

