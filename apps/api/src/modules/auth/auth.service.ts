import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UserStatus } from '../../generated/prisma/index.js';
import { UsersService } from '../users/users.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import type { JwtPayload } from './types/jwt-payload.type.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.usersService.create(dto);
    return this.issueTokens(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new ForbiddenException('Conta bloqueada. Entre em contato com o suporte.');
    }

    const passwordMatches = await argon2.verify(user.passwordHash, dto.password);

    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    return this.issueTokens(user.id, user.email, user.role);
  }

  async refresh(userId: string, refreshToken: string) {
    const isValid = await this.usersService.validateRefreshToken(userId, refreshToken);

    if (!isValid) {
      throw new ForbiddenException('Refresh token inválido.');
    }

    const user = await this.usersService.findById(userId);

    if (user.status === UserStatus.BLOCKED) {
      throw new ForbiddenException('Conta bloqueada. Entre em contato com o suporte.');
    }

    return this.issueTokens(user.id, user.email, user.role);
  }

  async refreshByToken(refreshToken: string) {
    const payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET')
    });

    return this.refresh(payload.sub, refreshToken);
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
    return { success: true };
  }

  async validateJwtPayload(payload: JwtPayload) {
    const user = await this.usersService.safeUser({ id: payload.sub });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado.');
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException('Conta bloqueada.');
    }

    return payload;
  }

  private async issueTokens(userId: string, email: string, role: JwtPayload['role']) {
    const payload: JwtPayload = {
      sub: userId,
      email,
      role
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: '15m'
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d'
      })
    ]);

    await this.usersService.updateRefreshToken(userId, refreshToken);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900
    };
  }
}
