import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role } from '../../generated/prisma/index.js';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';

export const userSelect = {
  id: true,
  email: true,
  fullName: true,
  role: true,
  status: true,
  phone: true,
  verificationStatus: true,
  isVerified: true,
  city: true,
  state: true,
  createdAt: true,
  teacherProfile: {
    select: {
      publicSlug: true,
      specialties: true,
      averageRating: true,
      totalReviews: true,
      totalLessons: true
    }
  },
  studentProfile: {
    select: {
      educationLevel: true,
      schoolName: true,
      studyGoal: true,
      futureInterests: true,
      notesAverage: true
    }
  }
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() }
    });

    if (existing) {
      throw new ConflictException('E-mail já cadastrado.');
    }

    const passwordHash = await argon2.hash(dto.password);
    const slugBase = dto.fullName
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        fullName: dto.fullName,
        role: dto.role,
        phone: dto.phone,
        teacherProfile:
          dto.role === Role.TEACHER
            ? {
                create: {
                  publicSlug: `${slugBase || 'professor'}-${Date.now()}`,
                  specialties: []
                }
              }
            : undefined,
        studentProfile: dto.role === Role.STUDENT ? { create: {} } : undefined
      },
      select: userSelect
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: userSelect
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return user;
  }

  async safeUser(where: Prisma.UserWhereUniqueInput) {
    return this.prisma.user.findUnique({
      where,
      select: userSelect
    });
  }

  async updateRefreshToken(userId: string, refreshToken: string | null) {
    const hashedRefreshToken = refreshToken ? await argon2.hash(refreshToken) : null;

    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken }
    });
  }

  async validateRefreshToken(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user?.hashedRefreshToken) {
      return false;
    }

    return argon2.verify(user.hashedRefreshToken, refreshToken);
  }
}
