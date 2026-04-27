import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { QueryCourtsDto } from './dto/query-courts.dto';

@Injectable()
export class CourtsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryCourtsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.CourtWhereInput = {};

    if (query.location) {
      where.location = { contains: query.location, mode: 'insensitive' };
    }

    if (query.minRating !== undefined) {
      where.averageRating = { gte: query.minRating };
    }

    // Filter courts that have at least one field with availability on this date
    if (query.date) {
      const dateStart = new Date(query.date);
      dateStart.setUTCHours(0, 0, 0, 0);
      const dateEnd = new Date(query.date);
      dateEnd.setUTCHours(23, 59, 59, 999);

      where.fields = {
        ...where.fields,
        some: {
          ...where.fields?.some,
          bookings: {
            none: {
              date: { gte: dateStart, lte: dateEnd },
              status: { in: ['CONFIRMED', 'PENDING'] },
            },
          },
        },
      };
    }

    if (query.hasLED) {
      where.fields = {
        ...where.fields,
        some: {
          ...where.fields?.some,
          features: { has: 'LED' },
        },
      };
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.fields = {
        ...where.fields,
        some: {
          ...where.fields?.some,
          pricePerHour: {
            ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
            ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
          },
        },
      };
    }


    const [data, total] = await Promise.all([
      this.prisma.court.findMany({
        where,
        skip,
        take: limit,
        include: {
          fields: true,
        },
        orderBy: { averageRating: 'desc' },
      }),
      this.prisma.court.count({ where }),
    ]);

    // Convert Decimal to number for all nested fields
    const mapped = data.map((court) => ({
      ...court,
      fields: court.fields.map((f) => ({
        ...f,
        pricePerHour: Number(f.pricePerHour),
      })),
    }));

    return { data: mapped, total, page, limit };
  }

  async findOne(id: string) {
    const court = await this.prisma.court.findUnique({
      where: { id },
      include: {
        fields: true,
      },
    });
    if (!court) throw new NotFoundException(`Court with id "${id}" not found`);

    return {
      ...court,
      fields: court.fields.map((f) => ({
        ...f,
        pricePerHour: Number(f.pricePerHour),
      })),
    };
  }
}
