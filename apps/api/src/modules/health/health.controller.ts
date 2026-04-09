import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    await this.prisma.$queryRaw`SELECT 1`;

    return {
      status: 'ok',
      service: 'mestre-aluno-api',
      timestamp: new Date().toISOString()
    };
  }
}

