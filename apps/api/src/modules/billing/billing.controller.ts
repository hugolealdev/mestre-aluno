import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import type { JwtPayload } from '../auth/types/jwt-payload.type.js';
import { BillingService } from './billing.service.js';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto.js';

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly configService: ConfigService
  ) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  async createCheckout(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateCheckoutSessionDto
  ) {
    return this.billingService.createCheckoutSession(
      user.sub,
      dto,
      this.configService.getOrThrow<string>('APP_URL')
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('portal')
  async customerPortal(@CurrentUser() user: JwtPayload) {
    return this.billingService.createCustomerPortal(
      user.sub,
      `${this.configService.getOrThrow<string>('APP_URL')}/painel`
    );
  }

  @HttpCode(200)
  @Post('webhooks/stripe')
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string | string[],
    @Req() request: Request & { rawBody?: Buffer }
  ) {
    const event = this.billingService.constructWebhookEvent(signature, request.rawBody ?? Buffer.alloc(0));
    return this.billingService.handleWebhook(event);
  }
}
