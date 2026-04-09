import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../../generated/prisma/index.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { GoogleCalendarService } from './google-calendar.service.js';

type GoogleOAuthState = {
  sub: string;
  role: Role;
  type: 'google_oauth';
};

@Injectable()
export class IntegrationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly googleCalendarService: GoogleCalendarService
  ) {}

  async createGoogleAuthorizationUrl(userId: string, role: Role) {
    if (role !== Role.TEACHER) {
      throw new ForbiddenException('Somente professores podem conectar o Google Calendar.');
    }

    const state = await this.jwtService.signAsync(
      {
        sub: userId,
        role,
        type: 'google_oauth'
      } satisfies GoogleOAuthState,
      {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: '10m'
      }
    );

    return {
      url: this.googleCalendarService.createAuthorizationUrl(state)
    };
  }

  async getGoogleConnectionStatus(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        role: true,
        googleRefreshToken: true
      }
    });

    return {
      provider: 'google',
      connected: Boolean(user.googleRefreshToken),
      role: user.role
    };
  }

  async handleGoogleCallback(code: string, state: string) {
    const payload = await this.jwtService.verifyAsync<GoogleOAuthState>(state, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET')
    });

    if (payload.type !== 'google_oauth' || payload.role !== Role.TEACHER) {
      throw new ForbiddenException('Fluxo de conexão Google inválido.');
    }

    const refreshToken = await this.googleCalendarService.exchangeCodeForRefreshToken(code);

    if (!refreshToken) {
      throw new ForbiddenException(
        'O Google não retornou refresh token. Revogue o acesso anterior e tente novamente.'
      );
    }

    await this.prisma.user.update({
      where: { id: payload.sub },
      data: {
        googleRefreshToken: refreshToken
      }
    });

    return {
      redirectUrl: `${this.configService.getOrThrow<string>('APP_URL')}/painel?google=connected`
    };
  }
}
