import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';
import {
  PaymentStatus,
  PaymentType,
  PlanTier,
  Role,
  SubscriptionStatus
} from '../../generated/prisma/index.js';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service.js';
import { ContentsService } from '../contents/contents.service.js';
import { StripeService } from '../integrations/stripe.service.js';
import { LessonsService } from '../lessons/lessons.service.js';
import { UsersService } from '../users/users.service.js';
import {
  BillingCheckoutType,
  CreateCheckoutSessionDto
} from './dto/create-checkout-session.dto.js';

@Injectable()
export class BillingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
    private readonly contentsService: ContentsService,
    private readonly lessonsService: LessonsService,
    private readonly usersService: UsersService
  ) {}

  async createCheckoutSession(userId: string, dto: CreateCheckoutSessionDto, appUrl: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const customerId = await this.getOrCreateCustomer(user.id, user.email, user.fullName);
    const paths = {
      successUrl: `${appUrl}${dto.successPath ?? '/painel'}?checkout=success`,
      cancelUrl: `${appUrl}${dto.cancelPath ?? '/painel'}?checkout=cancel`
    };

    switch (dto.type) {
      case BillingCheckoutType.STUDENT_SUBSCRIPTION:
        return this.createSubscriptionCheckout(user.id, customerId, Role.STUDENT, paths);
      case BillingCheckoutType.TEACHER_SUBSCRIPTION:
        return this.createSubscriptionCheckout(user.id, customerId, Role.TEACHER, paths);
      case BillingCheckoutType.VERIFICATION:
        return this.createVerificationCheckout(user.id, customerId, paths);
      default:
        throw new BadRequestException('Tipo de checkout inválido.');
    }
  }

  async createCustomerPortal(userId: string, returnUrl: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true }
    });

    if (!user?.stripeCustomerId) {
      throw new BadRequestException('Usuário ainda não possui cliente Stripe vinculado.');
    }

    const session = await this.stripeService.client.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl
    });

    return { url: session.url };
  }

  constructWebhookEvent(signature: string | string[] | undefined, rawBody: Buffer) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      throw new InternalServerErrorException('Webhook Stripe não configurado.');
    }

    return this.stripeService.client.webhooks.constructEvent(
      rawBody,
      Array.isArray(signature) ? signature[0] : signature,
      webhookSecret
    );
  }

  async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await this.handleSubscriptionChanged(event.data.object as Stripe.Subscription);
        break;
      case 'charge.refunded':
        await this.handleRefundedCharge(event.data.object as Stripe.Charge);
        break;
      default:
        break;
    }

    return { received: true };
  }

  private async createSubscriptionCheckout(
    userId: string,
    customerId: string,
    role: Role,
    paths: { successUrl: string; cancelUrl: string }
  ) {
    const priceId =
      role === Role.STUDENT
        ? process.env.STRIPE_STUDENT_PRICE_ID
        : process.env.STRIPE_TEACHER_PRICE_ID;

    if (!priceId) {
      throw new InternalServerErrorException(`Preço Stripe do plano ${role} não configurado.`);
    }

    const session = await this.stripeService.client.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      success_url: paths.successUrl,
      cancel_url: paths.cancelUrl,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: {
        userId,
        checkoutType: role === Role.STUDENT ? 'student_subscription' : 'teacher_subscription'
      }
    });

    await this.prisma.payment.create({
      data: {
        userId,
        stripeCheckoutId: session.id,
        type: PaymentType.SUBSCRIPTION,
        status: PaymentStatus.PENDING,
        amount: 0,
        metadataJson: {
          priceId,
          role
        }
      }
    });

    return { url: session.url, sessionId: session.id };
  }

  private async createVerificationCheckout(
    userId: string,
    customerId: string,
    paths: { successUrl: string; cancelUrl: string }
  ) {
    const priceId = process.env.STRIPE_VERIFICATION_PRICE_ID;

    if (!priceId) {
      throw new InternalServerErrorException('Preço Stripe da verificação não configurado.');
    }

    const session = await this.stripeService.client.checkout.sessions.create({
      mode: 'payment',
      customer: customerId,
      success_url: paths.successUrl,
      cancel_url: paths.cancelUrl,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: {
        userId,
        checkoutType: 'verification'
      }
    });

    await this.prisma.payment.create({
      data: {
        userId,
        stripeCheckoutId: session.id,
        type: PaymentType.VERIFICATION,
        status: PaymentStatus.PENDING,
        amount: 0,
        metadataJson: {
          priceId
        }
      }
    });

    return { url: session.url, sessionId: session.id };
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;

    if (!userId) {
      return;
    }

    await this.prisma.payment.updateMany({
      where: { stripeCheckoutId: session.id },
      data: {
        status: PaymentStatus.SUCCEEDED,
        stripePaymentIntentId:
          typeof session.payment_intent === 'string' ? session.payment_intent : null,
        amount: session.amount_total ? session.amount_total / 100 : 0
      }
    });

    if (session.mode === 'subscription' && typeof session.subscription === 'string') {
      const subscription = await this.stripeService.client.subscriptions.retrieve(session.subscription);
      await this.handleSubscriptionChanged(subscription);
      return;
    }

    if (session.metadata?.checkoutType === 'content_purchase') {
      await this.contentsService.fulfillPurchase(
        session.id,
        typeof session.payment_intent === 'string' ? session.payment_intent : null,
        session.amount_total
      );
      return;
    }

    if (session.metadata?.checkoutType === 'lesson_purchase') {
      await this.lessonsService.fulfillLesson(
        session.id,
        typeof session.payment_intent === 'string' ? session.payment_intent : null,
        session.amount_total
      );
      return;
    }

  }

  private async handleSubscriptionChanged(subscription: Stripe.Subscription) {
    const customerId = typeof subscription.customer === 'string' ? subscription.customer : null;

    if (!customerId) {
      return;
    }

    const user = await this.prisma.user.findFirst({
      where: { stripeCustomerId: customerId }
    });

    if (!user) {
      return;
    }

    const price = subscription.items.data[0]?.price?.id;
    const role =
      price === process.env.STRIPE_TEACHER_PRICE_ID
        ? Role.TEACHER
        : Role.STUDENT;

    await this.prisma.subscription.upsert({
      where: {
        stripeSubscriptionId: subscription.id
      },
      update: {
        role,
        tier: PlanTier.PRO,
        status: this.mapSubscriptionStatus(subscription.status),
        stripeCustomerId: customerId,
        currentPeriodStart: subscription.items.data[0]?.current_period_start
          ? new Date(subscription.items.data[0].current_period_start * 1000)
          : null,
        currentPeriodEnd: subscription.items.data[0]?.current_period_end
          ? new Date(subscription.items.data[0].current_period_end * 1000)
          : null,
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      },
      create: {
        userId: user.id,
        role,
        tier: PlanTier.PRO,
        status: this.mapSubscriptionStatus(subscription.status),
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        currentPeriodStart: subscription.items.data[0]?.current_period_start
          ? new Date(subscription.items.data[0].current_period_start * 1000)
          : null,
        currentPeriodEnd: subscription.items.data[0]?.current_period_end
          ? new Date(subscription.items.data[0].current_period_end * 1000)
          : null,
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      }
    });
  }

  private async handleRefundedCharge(charge: Stripe.Charge) {
    const paymentIntentId =
      typeof charge.payment_intent === 'string' ? charge.payment_intent : null;

    if (!paymentIntentId) {
      return;
    }

    await this.prisma.payment.updateMany({
      where: { stripePaymentIntentId: paymentIntentId },
      data: { status: PaymentStatus.REFUNDED }
    });
  }

  private async getOrCreateCustomer(userId: string, email: string, name: string) {
    const existing = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true }
    });

    if (existing?.stripeCustomerId) {
      return existing.stripeCustomerId;
    }

    const customer = await this.stripeService.client.customers.create({
      email,
      name,
      metadata: {
        userId
      }
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customer.id }
    });

    return customer.id;
  }

  private mapSubscriptionStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
    switch (status) {
      case 'active':
        return SubscriptionStatus.ACTIVE;
      case 'past_due':
        return SubscriptionStatus.PAST_DUE;
      case 'trialing':
        return SubscriptionStatus.TRIALING;
      case 'canceled':
      case 'unpaid':
      case 'paused':
        return SubscriptionStatus.CANCELED;
      default:
        return SubscriptionStatus.INCOMPLETE;
    }
  }
}
