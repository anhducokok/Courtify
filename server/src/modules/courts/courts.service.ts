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

    // Build combined field conditions so that the SAME field must satisfy all criteria
    const fieldConditions: any = {};

    if (query.hasLED) {
      fieldConditions.features = { has: 'LED' };
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      fieldConditions.pricePerHour = {
        ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
        ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
      };
    }

    // Add bookings condition if date is provided
    if (query.date) {
      const dateStart = new Date(query.date);
      dateStart.setUTCHours(0, 0, 0, 0);
      const dateEnd = new Date(query.date);
      dateEnd.setUTCHours(23, 59, 59, 999);

      fieldConditions.bookings = {
        none: {
          date: { gte: dateStart, lte: dateEnd },
          status: { in: ['CONFIRMED', 'PENDING'] },
        },
      };
    }

    if (Object.keys(fieldConditions).length > 0) {
      where.fields = { some: fieldConditions };
    }


    const [data, total] = await Promise.all([
      this.prisma.court.findMany({
        where,
        skip,
        take: limit,
        include: {
          fields: query.date ? {
            include: {
              bookings: {
                where: {
                  date: {
                    gte: new Date(query.date),
                    lt: new Date(new Date(query.date).getTime() + 24 * 60 * 60 * 1000),
                  },
                  status: { in: ['CONFIRMED', 'PENDING'] },
                },
              },
            },
          } : true,
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
        bookingsCount: query.date ? ((f as any).bookings as any[])?.length ?? 0 : 0,
      })),
    }));

    return { data: mapped, total, page, limit };
  }

  async findOne(id: string, date?: string) {
    // Try to find by UUID first; if not found, try by slug (name normalized)
    let court = await this.prisma.court.findUnique({
      where: { id },
      include: {
        fields: {
          include: {
            ...(date && {
              bookings: {
                where: {
                  date: {
                    gte: new Date(date),
                    lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
                  },
                  status: { in: ['CONFIRMED', 'PENDING'] },
                },
              },
            }),
          },
        },
      },
    });

    if (!court) {
      court = await this.prisma.court.findFirst({
        where: {
          name: { equals: id, mode: 'insensitive' },
        },
        include: {
          fields: {
            include: {
              ...(date && {
                bookings: {
                  where: {
                    date: {
                      gte: new Date(date),
                      lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
                    },
                    status: { in: ['CONFIRMED', 'PENDING'] },
                  },
                },
              }),
            },
          },
        },
      });
    }

    if (!court) throw new NotFoundException(`Court with id "${id}" not found`);

    return {
      ...court,
      fields: court.fields.map((f) => ({
        ...f,
        pricePerHour: Number(f.pricePerHour),
        bookingsCount: date ? ((f as any).bookings as any[])?.length ?? 0 : undefined,
        bookings: undefined,
      })),
    };
  }
}
