import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PlanType, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateFieldBookingPlanDto, UpdateFieldBookingPlanDto } from './dto/booking-plan.dto';

export interface ResolvedSlot {
  time: number; // minutes from midnight
  timeStr: string;
  available: boolean;
  price: number;
  blockedReason?: string;
}

@Injectable()
export class BookingPlansService {
  constructor(private readonly prisma: PrismaService) {}

  // ── CRUD ────────────────────────────────────────────────────────

  async findAllByField(fieldId: string) {
    await this.assertFieldExists(fieldId);

    const plans = await this.prisma.fieldBookingPlan.findMany({
      where: { fieldId },
      orderBy: [{ specificDate: 'asc' }, { daysOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    return {
      weekly: plans.filter((p) => p.isRecurring),
      exceptions: plans.filter((p) => !p.isRecurring),
    };
  }

  async create(fieldId: string, userId: string, role: Role, dto: CreateFieldBookingPlanDto) {
    await this.assertOwnership(fieldId, userId, role);

    if (dto.isRecurring !== false && (!dto.daysOfWeek || dto.daysOfWeek.length === 0)) {
      dto.daysOfWeek = [1, 2, 3, 4, 5, 6, 0]; // default: all days
    }

    const plan = await this.prisma.fieldBookingPlan.create({
      data: {
        fieldId,
        type: dto.type,
        priority: dto.priority ?? 0,
        startTime: dto.startTime,
        endTime: dto.endTime,
        timezone: dto.timezone ?? 'Asia/Ho_Chi_Minh',
        isRecurring: dto.isRecurring ?? true,
        daysOfWeek: dto.isRecurring !== false ? (dto.daysOfWeek ?? [1, 2, 3, 4, 5, 6, 0]) : [],
        specificDate: dto.specificDate ? new Date(dto.specificDate) : null,
        priceOverride: dto.priceOverride,
      },
    });

    return plan;
  }

  async update(
    planId: string,
    userId: string,
    role: Role,
    dto: UpdateFieldBookingPlanDto,
  ) {
    const plan = await this.prisma.fieldBookingPlan.findUnique({
      where: { id: planId },
      include: { field: { include: { court: true } } },
    });

    if (!plan) {
      throw new NotFoundException(`Booking plan "${planId}" not found`);
    }

    this.assertOwnerOrAdmin(plan.field.court.ownerId, userId, role);

    const updated = await this.prisma.fieldBookingPlan.update({
      where: { id: planId },
      data: {
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.priority !== undefined && { priority: dto.priority }),
        ...(dto.startTime !== undefined && { startTime: dto.startTime }),
        ...(dto.endTime !== undefined && { endTime: dto.endTime }),
        ...(dto.timezone !== undefined && { timezone: dto.timezone }),
        ...(dto.isRecurring !== undefined && { isRecurring: dto.isRecurring }),
        ...(dto.daysOfWeek !== undefined && { daysOfWeek: dto.daysOfWeek }),
        ...(dto.specificDate !== undefined && {
          specificDate: dto.specificDate ? new Date(dto.specificDate) : null,
        }),
        ...(dto.priceOverride !== undefined && { priceOverride: dto.priceOverride }),
      },
    });

    return updated;
  }

  async delete(planId: string, userId: string, role: Role) {
    const plan = await this.prisma.fieldBookingPlan.findUnique({
      where: { id: planId },
      include: { field: { include: { court: true } } },
    });

    if (!plan) {
      throw new NotFoundException(`Booking plan "${planId}" not found`);
    }

    this.assertOwnerOrAdmin(plan.field.court.ownerId, userId, role);

    await this.prisma.fieldBookingPlan.delete({ where: { id: planId } });

    return { message: `Booking plan "${planId}" deleted successfully` };
  }

  // ── Availability Resolution (Public) ───────────────────────────

  async getResolvedAvailability(fieldId: string, dateStr: string): Promise<ResolvedSlot[]> {
    const field = await this.prisma.field.findUnique({ where: { id: fieldId } });
    if (!field) {
      throw new NotFoundException(`Field "${fieldId}" not found`);
    }

    const date = new Date(dateStr);
    const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon, ...
    const dateStart = new Date(dateStr);
    dateStart.setUTCHours(0, 0, 0, 0);
    const dateEnd = new Date(dateStr);
    dateEnd.setUTCHours(23, 59, 59, 999);

    // Fetch applicable plans
    const [weeklyPlans, exceptionPlans, bookings] = await Promise.all([
      this.prisma.fieldBookingPlan.findMany({
        where: {
          fieldId,
          isRecurring: true,
          daysOfWeek: { has: dayOfWeek },
        },
      }),
      this.prisma.fieldBookingPlan.findMany({
        where: {
          fieldId,
          isRecurring: false,
          specificDate: { gte: dateStart, lte: dateEnd },
        },
      }),
      this.prisma.booking.findMany({
        where: {
          fieldId,
          date: { gte: dateStart, lte: dateEnd },
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
        include: { timeSlot: true },
      }),
    ]);

    const allPlans = [...weeklyPlans, ...exceptionPlans].sort((a, b) => b.priority - a.priority);

    const defaultPrice = Number(field.pricePerHour);
    const defaultAvailability = this.buildDayTimeline(allPlans, defaultPrice, date);

    // Subtract booked slots
    for (const booking of bookings) {
      const slotStart = this.timeToMinutes(booking.timeSlot.startTime);
      const slotEnd = this.timeToMinutes(booking.timeSlot.endTime);
      this.markUnavailable(defaultAvailability, slotStart, slotEnd);
    }

    return defaultAvailability;
  }

  // ── Availability Resolution (Legacy slot-based, uses existing TimeSlot table) ──

  async getSlotBasedAvailability(fieldId: string, dateStr: string) {
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();
    const dateStart = new Date(dateStr);
    dateStart.setUTCHours(0, 0, 0, 0);
    const dateEnd = new Date(dateStr);
    dateEnd.setUTCHours(23, 59, 59, 999);

    const [field, allTimeSlots, plans, bookings] = await Promise.all([
      this.prisma.field.findUnique({ where: { id: fieldId } }),
      this.prisma.timeSlot.findMany({ orderBy: { startTime: 'asc' } }),
      this.prisma.fieldBookingPlan.findMany({
        where: {
          fieldId,
          OR: [
            { isRecurring: true, daysOfWeek: { has: dayOfWeek } },
            { isRecurring: false, specificDate: { gte: dateStart, lte: dateEnd } },
          ],
        },
        orderBy: { priority: 'desc' },
      }),
      this.prisma.booking.findMany({
        where: {
          fieldId,
          date: { gte: dateStart, lte: dateEnd },
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
        include: { timeSlot: true },
      }),
    ]);

    if (!field) {
      throw new NotFoundException(`Field "${fieldId}" not found`);
    }

    const defaultPrice = Number(field.pricePerHour);

    const bookedSlotIds = new Set(
      bookings.map((b) => b.timeSlotId),
    );

    // For each time slot, determine availability + price
    return allTimeSlots.map((slot) => {
      const slotStart = this.timeToMinutes(slot.startTime);
      const slotEnd = this.timeToMinutes(slot.endTime);

      // Find the highest-priority plan covering this slot
      const applicablePlan = plans.find(
        (p) => slotStart >= p.startTime && slotEnd <= p.endTime,
      );

      let available = !bookedSlotIds.has(slot.id);
      let price = defaultPrice;
      let blockedReason: string | undefined;

      if (applicablePlan) {
        if (applicablePlan.type === PlanType.BLOCKED) {
          available = false;
          blockedReason = 'Blocked by booking plan';
        }
        if (applicablePlan.priceOverride !== null) {
          price = Number(applicablePlan.priceOverride);
        }
      }

      return {
        id: slot.id,
        startTime: slot.startTime.toISOString(),
        endTime: slot.endTime.toISOString(),
        status: bookedSlotIds.has(slot.id) ? 'BOOKED' : available ? 'AVAILABLE' : 'UNAVAILABLE',
        price,
        blockedReason,
      };
    });
  }

  // ── Helpers ─────────────────────────────────────────────────────

  private buildDayTimeline(
    plans: Prisma.FieldBookingPlanGetPayload<{}>[],
    defaultPrice: number,
    date: Date,
  ): ResolvedSlot[] {
    // Resolution: for each minute of the day, find the highest-priority plan covering it
    // Strategy: build segments by merging all plan boundaries and resolving each segment

    type RawPlan = {
      type: PlanType;
      priority: number;
      startTime: number;
      endTime: number;
      priceOverride: Prisma.Decimal | null;
    };

    const rawPlans: RawPlan[] = plans.map((p) => ({
      type: p.type,
      priority: p.priority,
      startTime: p.startTime,
      endTime: p.endTime,
      priceOverride: p.priceOverride,
    }));

    // Collect all unique boundary points
    const boundaries = new Set<number>();
    boundaries.add(0);
    for (const p of rawPlans) {
      boundaries.add(p.startTime);
      boundaries.add(p.endTime);
    }
    const sortedBoundaries = Array.from(boundaries).sort((a, b) => a - b);

    const slots: ResolvedSlot[] = [];

    for (let i = 0; i < sortedBoundaries.length - 1; i++) {
      const segStart = sortedBoundaries[i];
      const segEnd = sortedBoundaries[i + 1];
      if (segStart === segEnd) continue;

      // Find the highest-priority plan covering [segStart, segEnd)
      const coveringPlans = rawPlans.filter(
        (p) => segStart >= p.startTime && segEnd <= p.endTime,
      );
      const topPlan = coveringPlans.sort((a, b) => b.priority - a.priority)[0];

      let available = true;
      let price = defaultPrice;
      let blockedReason: string | undefined;

      if (topPlan) {
        if (topPlan.type === PlanType.BLOCKED) {
          available = false;
          blockedReason = 'Blocked by plan';
        }
        if (topPlan.priceOverride !== null) {
          price = Number(topPlan.priceOverride);
        }
      }

      slots.push({
        time: segStart,
        timeStr: this.minutesToTimeStr(segStart),
        available,
        price,
        blockedReason,
      });
    }

    return slots;
  }

  private markUnavailable(slots: ResolvedSlot[], from: number, to: number) {
    for (const slot of slots) {
      // Check if slot overlaps with [from, to)
      if (slot.time >= to) continue;
      if (slot.time + 60 <= from) continue; // assume min slot = 60 min

      // Partial or full overlap — mark as unavailable
      slot.available = false;
      slot.blockedReason = 'Already booked';
    }
  }

  private timeToMinutes(date: Date): number {
    const h = date.getHours();
    const m = date.getMinutes();
    return h * 60 + m;
  }

  private minutesToTimeStr(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  private async assertFieldExists(fieldId: string) {
    const field = await this.prisma.field.findUnique({ where: { id: fieldId } });
    if (!field) {
      throw new NotFoundException(`Field "${fieldId}" not found`);
    }
  }

  private async assertOwnership(fieldId: string, userId: string, role: Role) {
    const field = await this.prisma.field.findUnique({
      where: { id: fieldId },
      include: { court: true },
    });
    if (!field) {
      throw new NotFoundException(`Field "${fieldId}" not found`);
    }
    this.assertOwnerOrAdmin(field.court.ownerId, userId, role);
  }

  private assertOwnerOrAdmin(courtOwnerId: string | null, userId: string, role: Role) {
    if (role === Role.ADMIN) return;
    if (courtOwnerId && courtOwnerId === userId) return;
    throw new ForbiddenException(
      'Only the court owner or an admin can perform this action',
    );
  }
}
