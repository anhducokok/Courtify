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

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.pricePerHour = {};
      if (query.minPrice !== undefined) {
        (where.pricePerHour as Prisma.FloatFilter).gte = query.minPrice;
      }
      if (query.maxPrice !== undefined) {
        (where.pricePerHour as Prisma.FloatFilter).lte = query.maxPrice;
      }
    }

    if (query.hasLED !== undefined) {
      where.hasLED = query.hasLED;
    }

    if (query.surfaceType) {
      where.surfaceType = query.surfaceType;
    }

    if (query.minRating !== undefined) {
      where.averageRating = { gte: query.minRating };
    }

    if (query.date) {
      const dateStart = new Date(query.date);
      dateStart.setUTCHours(0, 0, 0, 0);
      const dateEnd = new Date(query.date);
      dateEnd.setUTCHours(23, 59, 59, 999);
      where.bookings = {
        none: {
          date: { gte: dateStart, lte: dateEnd },
          status: 'CONFIRMED',
        },
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.court.findMany({
        where,
        skip,
        take: limit,
        orderBy: { averageRating: 'desc' },
      }),
      this.prisma.court.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const court = await this.prisma.court.findUnique({ where: { id } });
    if (!court) throw new NotFoundException(`Court with id "${id}" not found`);
    return court;
  }

  async findAvailability(courtId: string, date: string) {
    await this.findOne(courtId);

    const dateStart = new Date(date);
    dateStart.setUTCHours(0, 0, 0, 0);
    const dateEnd = new Date(date);
    dateEnd.setUTCHours(23, 59, 59, 999);

    const bookedSlots = await this.prisma.booking.findMany({
      where: {
        courtId,
        date: { gte: dateStart, lte: dateEnd },
        status: { in: ['CONFIRMED', 'PENDING'] },
      },
      select: { timeSlotId: true },
    });

    const bookedIds = bookedSlots.map((b) => b.timeSlotId);

    return this.prisma.timeSlot.findMany({
      where: { id: { notIn: bookedIds } },
      orderBy: { startTime: 'asc' },
    });
  }
}
