import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import type { JwtPayload } from '../auth/types/jwt-payload.type.js';
import { IntegrationsService } from './integrations.service.js';

@ApiTags('integrations')
@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('google/authorize')
  async googleAuthorize(@CurrentUser() user: JwtPayload) {
    return this.integrationsService.createGoogleAuthorizationUrl(user.sub, user.role);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('google/status')
  async googleStatus(@CurrentUser() user: JwtPayload) {
    return this.integrationsService.getGoogleConnectionStatus(user.sub);
  }

  @Get('google/callback')
  async googleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() response: Response
  ) {
    try {
      const { redirectUrl } = await this.integrationsService.handleGoogleCallback(code, state);
      return response.redirect(redirectUrl);
    } catch {
      return response.redirect(`${process.env.APP_URL ?? ''}/painel?google=error`);
    }
  }
}
