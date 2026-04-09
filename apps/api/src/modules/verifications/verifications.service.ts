import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { PaymentStatus, VerificationStatus } from '../../generated/prisma/index.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { SupabaseAdminService } from '../integrations/supabase-admin.service.js';
import { CreateVerificationRequestDto } from './dto/create-verification-request.dto.js';
import { RequestVerificationUploadDto } from './dto/request-verification-upload.dto.js';
import { ReviewVerificationDto } from './dto/review-verification.dto.js';

@Injectable()
export class VerificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseAdminService: SupabaseAdminService
  ) {}

  async requestUpload(userId: string, dto: RequestVerificationUploadDto, kind: 'document' | 'selfie') {
    const safeFileName = dto.fileName.replace(/[^a-zA-Z0-9._-]/g, '-');
    const path = `verifications/${userId}/${kind}-${Date.now()}-${safeFileName}`;
    const upload = await this.supabaseAdminService.createSignedUploadUrl(path);

    return {
      path,
      token: upload.token,
      signedUrl: upload.signedUrl
    };
  }

  async createRequest(userId: string, dto: CreateVerificationRequestDto) {
    const paidVerification = await this.prisma.payment.findFirst({
      where: {
        userId,
        type: 'VERIFICATION',
        status: PaymentStatus.SUCCEEDED
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!paidVerification) {
      throw new BadRequestException('Pagamento de verificação ainda não confirmado.');
    }

    const existingPending = await this.prisma.verificationRequest.findFirst({
      where: {
        userId,
        status: VerificationStatus.PENDING
      }
    });

    if (existingPending) {
      throw new BadRequestException('Já existe uma verificação pendente para este usuário.');
    }

    return this.prisma.verificationRequest.create({
      data: {
        userId,
        paymentId: paidVerification.id,
        documentPath: dto.documentPath,
        selfieDocumentPath: dto.selfieDocumentPath,
        status: VerificationStatus.PENDING
      }
    });
  }

  async myRequests(userId: string) {
    return this.prisma.verificationRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async adminList() {
    return this.prisma.verificationRequest.findMany({
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            isVerified: true,
            verificationStatus: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async approve(requestId: string) {
    const request = await this.prisma.verificationRequest.findUnique({
      where: { id: requestId }
    });

    if (!request) {
      throw new NotFoundException('Solicitação de verificação não encontrada.');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.verificationRequest.update({
        where: { id: requestId },
        data: {
          status: VerificationStatus.APPROVED,
          rejectionReason: null,
          resendDeadlineAt: null
        }
      });

      await tx.user.update({
        where: { id: request.userId },
        data: {
          isVerified: true,
          verificationStatus: VerificationStatus.APPROVED
        }
      });

      return updated;
    });
  }

  async reject(requestId: string, dto: ReviewVerificationDto) {
    const request = await this.prisma.verificationRequest.findUnique({
      where: { id: requestId }
    });

    if (!request) {
      throw new NotFoundException('Solicitação de verificação não encontrada.');
    }

    if (!dto.rejectionReason) {
      throw new BadRequestException('Motivo da reprovação é obrigatório.');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.verificationRequest.update({
        where: { id: requestId },
        data: {
          status: VerificationStatus.REJECTED,
          rejectionReason: dto.rejectionReason,
          resendDeadlineAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
        }
      });

      await tx.user.update({
        where: { id: request.userId },
        data: {
          isVerified: false,
          verificationStatus: VerificationStatus.REJECTED
        }
      });

      return updated;
    });
  }

  async getAdminFileUrl(requestId: string, kind: 'document' | 'selfie') {
    const request = await this.prisma.verificationRequest.findUnique({
      where: { id: requestId }
    });

    if (!request) {
      throw new NotFoundException('Solicitação de verificação não encontrada.');
    }

    const path = kind === 'document' ? request.documentPath : request.selfieDocumentPath;

    if (!path) {
      throw new ForbiddenException('Arquivo não encontrado.');
    }

    const url = await this.supabaseAdminService.createSignedDownloadUrl(path, 120);
    return { url };
  }
}

