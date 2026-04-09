import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  readonly client: Stripe;

  constructor(private readonly configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');

    if (!secretKey) {
      throw new InternalServerErrorException('STRIPE_SECRET_KEY não configurada.');
    }

    this.client = new Stripe(secretKey, {
      apiVersion: '2025-08-27.basil'
    });
  }
}
