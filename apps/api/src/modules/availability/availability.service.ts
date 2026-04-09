import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpsertAvailabilityDto } from './dto/upsert-availability.dto.js';

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async listTeacherAvailability(teacherId: string) {
    return this.prisma.teacherAvailability.findMany({
      where: { teacherId },
      orderBy: [{ weekday: 'asc' }, { startTime: 'asc' }]
    });
  }

  async createAvailability(teacherId: string, dto: UpsertAvailabilityDto) {
    if (dto.startTime >= dto.endTime) {
      throw new BadRequestException('Hora inicial deve ser menor que a hora final.');
    }

    return this.prisma.teacherAvailability.create({
      data: {
        teacherId,
        weekday: dto.weekday,
        startTime: dto.startTime,
        endTime: dto.endTime
      }
    });
  }

  async deleteAvailability(teacherId: string, availabilityId: string) {
    await this.prisma.teacherAvailability.deleteMany({
      where: {
        id: availabilityId,
        teacherId
      }
    });

    return { success: true };
  }
}
