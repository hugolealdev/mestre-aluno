import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentStatus, Role, UserStatus, VerificationStatus } from '../../generated/prisma/index.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { SearchDiscoveryDto } from './dto/search-discovery.dto.js';

@Injectable()
export class DiscoveryService {
  constructor(private readonly prisma: PrismaService) {}

  async search(dto: SearchDiscoveryDto) {
    const searchTerm = dto.q?.trim();
    const city = dto.city?.trim();

    const teachers = await this.prisma.user.findMany({
      where: {
        role: Role.TEACHER,
        status: UserStatus.ACTIVE,
        ...(city ? { city: { contains: city, mode: 'insensitive' } } : {}),
        ...(searchTerm
          ? {
              OR: [
                { fullName: { contains: searchTerm, mode: 'insensitive' } },
                { headline: { contains: searchTerm, mode: 'insensitive' } },
                { bio: { contains: searchTerm, mode: 'insensitive' } },
                {
                  teacherProfile: {
                    specialties: {
                      hasSome: [searchTerm]
                    }
                  }
                }
              ]
            }
          : {})
      },
      select: {
        id: true,
        fullName: true,
        headline: true,
        bio: true,
        city: true,
        isVerified: true,
        verificationStatus: true,
        teacherProfile: {
          select: {
            publicSlug: true,
            specialties: true,
            averageRating: true,
            totalReviews: true,
            totalLessons: true,
            publicBasePrice: true
          }
        }
      },
      orderBy: [{ isVerified: 'desc' }, { createdAt: 'desc' }]
    });

    const contents = await this.prisma.content.findMany({
      where: {
        status: ContentStatus.PUBLISHED,
        ...(searchTerm
          ? {
              OR: [
                { title: { contains: searchTerm, mode: 'insensitive' } },
                { description: { contains: searchTerm, mode: 'insensitive' } },
                { preview: { contains: searchTerm, mode: 'insensitive' } },
                {
                  teacher: {
                    fullName: { contains: searchTerm, mode: 'insensitive' }
                  }
                }
              ]
            }
          : {}),
        ...(city
          ? {
              teacher: {
                city: { contains: city, mode: 'insensitive' }
              }
            }
          : {})
      },
      include: {
        teacher: {
          select: {
            fullName: true,
            city: true,
            isVerified: true,
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

    return {
      teachers,
      contents
    };
  }

  async publicTeacherProfile(publicSlug: string) {
    const teacher = await this.prisma.user.findFirst({
      where: {
        role: Role.TEACHER,
        status: UserStatus.ACTIVE,
        teacherProfile: {
          publicSlug
        }
      },
      select: {
        id: true,
        fullName: true,
        headline: true,
        bio: true,
        city: true,
        state: true,
        isVerified: true,
        verificationStatus: true,
        teacherProfile: {
          select: {
            publicSlug: true,
            specialties: true,
            averageRating: true,
            totalReviews: true,
            totalLessons: true,
            publicBasePrice: true
          }
        },
        teacherAvailabilities: {
          orderBy: [{ weekday: 'asc' }, { startTime: 'asc' }]
        },
        publishedContents: {
          where: { status: ContentStatus.PUBLISHED },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            preview: true,
            priceAmount: true
          }
        }
      }
    });

    if (!teacher) {
      throw new NotFoundException('Professor não encontrado.');
    }

    return teacher;
  }
}

