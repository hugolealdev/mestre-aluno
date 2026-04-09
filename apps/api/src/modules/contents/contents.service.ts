import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { ContentStatus, PaymentStatus, PaymentType, Role } from '../../generated/prisma/index.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { StripeService } from '../integrations/stripe.service.js';
import { SupabaseAdminService } from '../integrations/supabase-admin.service.js';
import { CreateContentDto } from './dto/create-content.dto.js';
import { RequestContentUploadDto } from './dto/request-content-upload.dto.js';
import { UpdateContentDto } from './dto/update-content.dto.js';

@Injectable()
export class ContentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
    private readonly supabaseAdminService: SupabaseAdminService
  ) {}

  async requestUpload(userId: string, role: Role, dto: RequestContentUploadDto) {
    if (role !== Role.TEACHER) {
      throw new ForbiddenException('Apenas professores podem enviar conteúdos.');
    }

    const safeFileName = dto.fileName.replace(/[^a-zA-Z0-9._-]/g, '-');
    const path = `teachers/${userId}/contents/${Date.now()}-${safeFileName}`;
    const upload = await this.supabaseAdminService.createSignedUploadUrl(path);

    return {
      path,
      token: upload.token,
      signedUrl: upload.signedUrl
    };
  }

  async create(userId: string, role: Role, dto: CreateContentDto) {
    if (role !== Role.TEACHER) {
      throw new ForbiddenException('Apenas professores podem publicar conteúdos.');
    }

    return this.prisma.content.create({
      data: {
        teacherId: userId,
        title: dto.title,
        description: dto.description,
        preview: dto.preview,
        priceAmount: dto.priceAmount,
        filePath: dto.filePath,
        fileMimeType: dto.fileMimeType,
        status: ContentStatus.PUBLISHED
      }
    });
  }

  async listPublished() {
    return this.prisma.content.findMany({
      where: { status: ContentStatus.PUBLISHED },
      include: {
        teacher: {
          select: {
            id: true,
            fullName: true,
            isVerified: true,
            city: true,
            teacherProfile: {
              select: {
                publicSlug: true,
                specialties: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async listMine(userId: string) {
    return this.prisma.content.findMany({
      where: { teacherId: userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async update(userId: string, contentId: string, dto: UpdateContentDto) {
    const content = await this.prisma.content.findUnique({
      where: { id: contentId }
    });

    if (!content) {
      throw new NotFoundException('Conteúdo não encontrado.');
    }

    if (content.teacherId !== userId) {
      throw new ForbiddenException('Conteúdo não pertence ao professor autenticado.');
    }

    return this.prisma.content.update({
      where: { id: contentId },
      data: dto
    });
  }

  async createCheckout(userId: string, contentId: string, appUrl: string) {
    const content = await this.prisma.content.findUnique({
      where: { id: contentId }
    });

    if (!content || content.status !== ContentStatus.PUBLISHED) {
      throw new NotFoundException('Conteúdo não disponível para compra.');
    }

    if (content.teacherId === userId) {
      throw new BadRequestException('Professor não pode comprar o próprio conteúdo.');
    }

    const existingPurchase = await this.prisma.contentPurchase.findFirst({
      where: {
        contentId,
        studentId: userId,
        paymentStatus: PaymentStatus.SUCCEEDED
      }
    });

    if (existingPurchase) {
      throw new BadRequestException('Conteúdo já adquirido por este aluno.');
    }

    const session = await this.stripeService.client.checkout.sessions.create({
      mode: 'payment',
      success_url: `${appUrl}/painel?content=success`,
      cancel_url: `${appUrl}/painel?content=cancel`,
      line_items: [
        {
          price_data: {
            currency: 'brl',
            unit_amount: Math.round(Number(content.priceAmount) * 100),
            product_data: {
              name: content.title,
              description: content.preview
            }
          },
          quantity: 1
        }
      ],
      metadata: {
        userId,
        contentId,
        checkoutType: 'content_purchase'
      }
    });

    const purchase = await this.prisma.contentPurchase.create({
      data: {
        contentId,
        studentId: userId,
        stripeCheckoutId: session.id,
        paidAmount: 0,
        snapshotTitle: content.title,
        snapshotPreview: content.preview,
        snapshotFilePath: content.filePath
      }
    });

    await this.prisma.payment.create({
      data: {
        userId,
        contentPurchaseId: purchase.id,
        stripeCheckoutId: session.id,
        type: PaymentType.CONTENT,
        status: PaymentStatus.PENDING,
        amount: 0,
        metadataJson: {
          contentId
        }
      }
    });

    return { url: session.url, sessionId: session.id };
  }

  async fulfillPurchase(sessionId: string, paymentIntentId: string | null, amountTotal: number | null) {
    const purchase = await this.prisma.contentPurchase.findUnique({
      where: { stripeCheckoutId: sessionId }
    });

    if (!purchase) {
      return;
    }

    await this.prisma.contentPurchase.update({
      where: { id: purchase.id },
      data: {
        paymentStatus: PaymentStatus.SUCCEEDED,
        paidAmount: amountTotal ? amountTotal / 100 : 0
      }
    });

    await this.prisma.payment.updateMany({
      where: { contentPurchaseId: purchase.id },
      data: {
        status: PaymentStatus.SUCCEEDED,
        stripePaymentIntentId: paymentIntentId,
        amount: amountTotal ? amountTotal / 100 : 0
      }
    });
  }

  async listLibrary(userId: string) {
    return this.prisma.contentPurchase.findMany({
      where: {
        studentId: userId,
        paymentStatus: PaymentStatus.SUCCEEDED
      },
      include: {
        content: {
          select: {
            id: true,
            teacher: {
              select: {
                fullName: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getDownloadUrl(userId: string, purchaseId: string) {
    const purchase = await this.prisma.contentPurchase.findUnique({
      where: { id: purchaseId }
    });

    if (!purchase || purchase.studentId !== userId || purchase.paymentStatus !== PaymentStatus.SUCCEEDED) {
      throw new ForbiddenException('Compra não autorizada para download.');
    }

    const url = await this.supabaseAdminService.createSignedDownloadUrl(purchase.snapshotFilePath, 120);
    return { url };
  }
}
