import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { QueryBookingsDto } from './dto/query-bookings.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateBookingDto) {
    const date = new Date(dto.date);
    date.setUTCHours(0, 0, 0, 0);

    try {
      return await this.prisma.booking.create({
        data: {
          userId,
          courtId: dto.courtId,
          timeSlotId: dto.timeSlotId,
          date,
        },
        include: { court: true, timeSlot: true },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException('This time slot is already booked');
      }
      throw err;
    }
  }

  async findAll(userId: string, role: Role, query: QueryBookingsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.BookingWhereInput = {};

    if (role !== Role.ADMIN) {
      where.userId = userId;
    }

    if (query.status) {
      where.status = query.status;
    }

    const [data, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { court: true, timeSlot: true },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string, userId: string, role: Role) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { court: true, timeSlot: true },
    });

    if (!booking) {
      throw new NotFoundException(`Booking "${id}" not found`);
    }

    if (role !== Role.ADMIN && booking.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return booking;
  }

  async cancel(id: string, userId: string, role: Role) {
    const booking = await this.findOne(id, userId, role);

    if (booking.status === 'CANCELLED') {
      throw new ConflictException('Booking is already cancelled');
    }

    return this.prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: { court: true, timeSlot: true },
    });
  }

  async updateStatus(id: string, dto: UpdateBookingStatusDto) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      throw new NotFoundException(`Booking "${id}" not found`);
    }

    return this.prisma.booking.update({
      where: { id },
      data: { status: dto.status },
      include: { court: true, timeSlot: true },
    });
  }
}
