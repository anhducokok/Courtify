import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateFieldDto } from './dto/create-field.dto';
import { QueryFieldsDto } from './dto/query-fields.dto';
import { UpdateFieldDto } from './dto/update-field.dto';

@Injectable()
export class FieldsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── List fields (flat route) ──────────────────────────────────
  async findAll(query: QueryFieldsDto & { date?: string }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.FieldWhereInput = {};

    if (query.courtId) {
      where.courtId = query.courtId;
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.pricePerHour = {};
      if (query.minPrice !== undefined) {
        (where.pricePerHour as Prisma.DecimalFilter).gte = query.minPrice;
      }
      if (query.maxPrice !== undefined) {
        (where.pricePerHour as Prisma.DecimalFilter).lte = query.maxPrice;
      }
    }

    if (query.features?.length) {
      where.features = { hasEvery: query.features };
    }

    const [data, total] = await Promise.all([
      this.prisma.field.findMany({
        where,
        skip,
        take: limit,
        include: {
          court: true,
          ...(query.date && {
            bookings: {
              where: {
                date: {
                  gte: new Date(query.date),
                  lt: new Date(new Date(query.date).getTime() + 24 * 60 * 60 * 1000),
                },
                status: { in: ['CONFIRMED', 'PENDING'] },
              },
            },
          }),
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.field.count({ where }),
    ]);

    return {
      data: data.map((f) => ({
        ...f,
        pricePerHour: Number(f.pricePerHour),
        bookingsCount: query.date ? ((f as any).bookings as any[])?.length ?? 0 : undefined,
        bookings: undefined,
      })),
      total,
      page,
      limit,
    };
  }

  // ── List fields by court (nested route) ───────────────────────
  async findByCourtId(courtId: string, date?: string) {
    // Verify court exists
    const court = await this.prisma.court.findUnique({
      where: { id: courtId },
    });
    if (!court) {
      throw new NotFoundException(`Court "${courtId}" not found`);
    }

    const fields = await this.prisma.field.findMany({
      where: { courtId },
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
      orderBy: { name: 'asc' },
    });

    return fields.map((f) => ({
      ...f,
      pricePerHour: Number(f.pricePerHour),
      bookingsCount: date ? ((f as any).bookings as any[])?.length ?? 0 : undefined,
      bookings: undefined,
    }));
  }

  // ── Get single field ──────────────────────────────────────────
  async findOne(id: string, date?: string) {
    const field = await this.prisma.field.findUnique({
      where: { id },
      include: {
        court: true,
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
    });
    if (!field) {
      throw new NotFoundException(`Field "${id}" not found`);
    }
    return {
      ...field,
      pricePerHour: Number(field.pricePerHour),
      bookingsCount: date ? ((field as any).bookings as any[])?.length ?? 0 : undefined,
      bookings: undefined,
    };
  }

  // ── Create field ──────────────────────────────────────────────
  async create(userId: string, role: Role, courtId: string, dto: CreateFieldDto) {
    const court = await this.prisma.court.findUnique({
      where: { id: courtId },
    });
    if (!court) {
      throw new NotFoundException(`Court "${courtId}" not found`);
    }

    this.assertOwnerOrAdmin(court.ownerId, userId, role);

    const field = await this.prisma.field.create({
      data: {
        name: dto.name,
        pricePerHour: dto.pricePerHour,
        features: dto.features ?? [],
        courtId,
      },
      include: { court: true },
    });

    return { ...field, pricePerHour: Number(field.pricePerHour) };
  }

  // ── Update field ──────────────────────────────────────────────
  async update(id: string, userId: string, role: Role, dto: UpdateFieldDto) {
    const field = await this.prisma.field.findUnique({
      where: { id },
      include: { court: true },
    });
    if (!field) {
      throw new NotFoundException(`Field "${id}" not found`);
    }

    this.assertOwnerOrAdmin(field.court.ownerId, userId, role);

    const updated = await this.prisma.field.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.pricePerHour !== undefined && {
          pricePerHour: dto.pricePerHour,
        }),
        ...(dto.features !== undefined && { features: dto.features }),
      },
      include: { court: true },
    });

    return { ...updated, pricePerHour: Number(updated.pricePerHour) };
  }

  // ── Delete field ──────────────────────────────────────────────
  async delete(id: string, userId: string, role: Role) {
    const field = await this.prisma.field.findUnique({
      where: { id },
      include: { court: true },
    });
    if (!field) {
      throw new NotFoundException(`Field "${id}" not found`);
    }

    this.assertOwnerOrAdmin(field.court.ownerId, userId, role);

    // Reject if active bookings exist
    const activeBookings = await this.prisma.booking.count({
      where: {
        fieldId: id,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });

    if (activeBookings > 0) {
      throw new ConflictException(
        'Field has active bookings and cannot be deleted',
      );
    }

    await this.prisma.field.delete({ where: { id } });

    return { message: `Field "${id}" deleted successfully` };
  }

  // ── Availability (slot-based, handle overlap) ─────────────────
  async findAvailability(fieldId: string, date: string) {
    // Verify field exists
    const field = await this.prisma.field.findUnique({
      where: { id: fieldId },
    });
    if (!field) {
      throw new NotFoundException(`Field "${fieldId}" not found`);
    }

    const dateStart = new Date(date);
    dateStart.setUTCHours(0, 0, 0, 0);
    const dateEnd = new Date(date);
    dateEnd.setUTCHours(23, 59, 59, 999);

    // Find all booked time slots for this field on the given date with their status
    const bookedSlots = await this.prisma.booking.findMany({
      where: {
        fieldId,
        date: { gte: dateStart, lte: dateEnd },
        status: { in: ['CONFIRMED', 'PENDING'] },
      },
      select: { timeSlotId: true, status: true },
    });

    // Build a map: timeSlotId -> status (PENDING or CONFIRMED)
    const slotStatusMap: Record<string, string> = {};
    for (const b of bookedSlots) {
      // If multiple bookings on same slot, prefer CONFIRMED over PENDING
      if (!slotStatusMap[b.timeSlotId] || b.status === 'CONFIRMED') {
        slotStatusMap[b.timeSlotId] = b.status;
      }
    }

    // Return ALL slots with their availability status
    const allSlots = await this.prisma.timeSlot.findMany({
      orderBy: { startTime: 'asc' },
    });

    return allSlots.map((slot) => ({
      id: slot.id,
      startTime: slot.startTime.toISOString(),
      endTime: slot.endTime.toISOString(),
      status: slotStatusMap[slot.id] ?? 'AVAILABLE',
    }));
  }

  // ── Auth helper ───────────────────────────────────────────────
  private assertOwnerOrAdmin(
    courtOwnerId: string | null,
    userId: string,
    role: Role,
  ) {
    if (role === Role.ADMIN) return;
    if (courtOwnerId && courtOwnerId === userId) return;
    throw new ForbiddenException(
      'Only the court owner or an admin can perform this action',
    );
  }
}
