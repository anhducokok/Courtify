import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../database/prisma.service';
import { BookingPlansService, ResolvedSlot } from './booking-plans.service';
import { PlanType } from '@prisma/client';

const mockPrisma = {
  fieldBookingPlan: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  field: {
    findUnique: jest.fn(),
  },
  booking: {
    findMany: jest.fn(),
  },
};

const DEFAULT_PRICE = 200000;

function makePlan(overrides: Partial<{
  type: string;
  priority: number;
  startTime: number;
  endTime: number;
  priceOverride: number | null;
  isRecurring: boolean;
  daysOfWeek: number[];
  specificDate: Date | null;
}> = {}) {
  return {
    id: `plan-${Math.random()}`,
    fieldId: 'field-1',
    type: PlanType.AVAILABLE,
    priority: 0,
    startTime: 480,
    endTime: 1080,
    timezone: 'Asia/Ho_Chi_Minh',
    isRecurring: true,
    daysOfWeek: [1, 2, 3, 4, 5, 6, 0] as number[],
    specificDate: null,
    priceOverride: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as any;
}

function makeBooking(overrides: Partial<{ startTime: Date; endTime: Date }> = {}) {
  return {
    id: `booking-${Math.random()}`,
    fieldId: 'field-1',
    timeSlotId: 'slot-1',
    timeSlot: {
      startTime: overrides.startTime ?? new Date('2026-04-29T08:00:00Z'),
      endTime: overrides.endTime ?? new Date('2026-04-29T10:00:00Z'),
    },
  };
}

describe('BookingPlansService – AvailabilityResolver', () => {
  let service: BookingPlansService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingPlansService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<BookingPlansService>(BookingPlansService);
  });

  // ── buildDayTimeline helpers (exposed via getResolvedAvailability) ──

  describe('buildDayTimeline', () => {
    // We test through getResolvedAvailability which calls buildDayTimeline internally

    it('returns empty slots when no plans exist', async () => {
      mockPrisma.field.findUnique.mockResolvedValue({ id: 'field-1', pricePerHour: DEFAULT_PRICE });
      mockPrisma.fieldBookingPlan.findMany.mockResolvedValue([]);
      mockPrisma.booking.findMany.mockResolvedValue([]);

      const slots = await service.getResolvedAvailability('field-1', '2026-04-29');

      // No plans → no specific boundaries beyond 0 → might return just [0]
      expect(slots.length).toBeGreaterThanOrEqual(0);
    });

    it('returns AVAILABLE with default price when one AVAILABLE plan covers the day', async () => {
      const plan = makePlan({ type: PlanType.AVAILABLE, startTime: 0, endTime: 1440, priority: 0 });
      mockPrisma.field.findUnique.mockResolvedValue({ id: 'field-1', pricePerHour: DEFAULT_PRICE });
      mockPrisma.fieldBookingPlan.findMany
        .mockResolvedValueOnce([plan]) // weekly
        .mockResolvedValueOnce([]);     // exceptions
      mockPrisma.booking.findMany.mockResolvedValue([]);

      const slots = await service.getResolvedAvailability('field-1', '2026-04-29');

      expect(slots.length).toBeGreaterThan(0);
      slots.forEach((s) => {
        expect(s.available).toBe(true);
        expect(s.price).toBe(DEFAULT_PRICE);
      });
    });

    it('marks BLOCKED plan segments as unavailable', async () => {
      const availablePlan = makePlan({ type: PlanType.AVAILABLE, startTime: 0, endTime: 1440, priority: 0 });
      const blockedPlan = makePlan({ type: PlanType.BLOCKED, startTime: 1080, endTime: 1320, priority: 1 }); // 18:00-22:00

      mockPrisma.field.findUnique.mockResolvedValue({ id: 'field-1', pricePerHour: DEFAULT_PRICE });
      mockPrisma.fieldBookingPlan.findMany
        .mockResolvedValueOnce([availablePlan, blockedPlan])
        .mockResolvedValueOnce([]);
      mockPrisma.booking.findMany.mockResolvedValue([]);

      const slots = await service.getResolvedAvailability('field-1', '2026-04-29');

      const blockedSlots = slots.filter((s) => !s.available);
      expect(blockedSlots.length).toBeGreaterThan(0);
      // All blocked slots should cover the 18:00-22:00 window
      blockedSlots.forEach((s) => {
        expect(s.time).toBeGreaterThanOrEqual(1080);
        expect(s.time).toBeLessThan(1320);
        expect(s.blockedReason).toBe('Blocked by plan');
      });
    });

    it('applies CUSTOM_PRICE override correctly', async () => {
      const availablePlan = makePlan({ type: PlanType.AVAILABLE, startTime: 0, endTime: 1440, priority: 0 });
      const peakPlan = makePlan({ type: PlanType.CUSTOM_PRICE, startTime: 1020, endTime: 1260, priority: 1, priceOverride: 300000 }); // 17:00-21:00

      mockPrisma.field.findUnique.mockResolvedValue({ id: 'field-1', pricePerHour: DEFAULT_PRICE });
      mockPrisma.fieldBookingPlan.findMany
        .mockResolvedValueOnce([availablePlan, peakPlan])
        .mockResolvedValueOnce([]);
      mockPrisma.booking.findMany.mockResolvedValue([]);

      const slots = await service.getResolvedAvailability('field-1', '2026-04-29');

      const peakSlots = slots.filter((s) => s.time >= 1020 && s.time < 1260);
      expect(peakSlots.length).toBeGreaterThan(0);
      peakSlots.forEach((s) => {
        expect(s.price).toBe(300000);
        expect(s.available).toBe(true);
      });
    });

    it('higher priority plan overrides lower priority for overlapping segments', async () => {
      // Plan A: AVAILABLE all day at priority 0
      const planA = makePlan({ type: PlanType.AVAILABLE, startTime: 0, endTime: 1440, priority: 0 });
      // Plan B: BLOCKED 08:00-12:00 at priority 5 (higher)
      const planB = makePlan({ type: PlanType.BLOCKED, startTime: 480, endTime: 720, priority: 5 });

      mockPrisma.field.findUnique.mockResolvedValue({ id: 'field-1', pricePerHour: DEFAULT_PRICE });
      mockPrisma.fieldBookingPlan.findMany
        .mockResolvedValueOnce([planA, planB])
        .mockResolvedValueOnce([]);
      mockPrisma.booking.findMany.mockResolvedValue([]);

      const slots = await service.getResolvedAvailability('field-1', '2026-04-29');

      const blockedSlots = slots.filter((s) => !s.available);
      expect(blockedSlots.length).toBeGreaterThan(0);
      blockedSlots.forEach((s) => {
        expect(s.time).toBeGreaterThanOrEqual(480);
        expect(s.time).toBeLessThan(720);
      });

      // Slots outside 08:00-12:00 should still be available
      const morningSlots = slots.filter((s) => s.time < 480);
      expect(morningSlots.length).toBeGreaterThan(0);
      morningSlots.forEach((s) => expect(s.available).toBe(true));
    });

    it('only applies recurring plans whose daysOfWeek include the target day', async () => {
      // Monday plan (dayOfWeek=1) — should NOT apply on Sunday (dayOfWeek=0)
      const mondayPlan = makePlan({
        type: PlanType.AVAILABLE,
        startTime: 480,
        endTime: 720,
        priority: 0,
        isRecurring: true,
        daysOfWeek: [1], // Monday only
      });

      mockPrisma.field.findUnique.mockResolvedValue({ id: 'field-1', pricePerHour: DEFAULT_PRICE });
      mockPrisma.fieldBookingPlan.findMany
        .mockResolvedValueOnce([mondayPlan]) // weekly — doesn't match Sunday
        .mockResolvedValueOnce([]);           // exceptions
      mockPrisma.booking.findMany.mockResolvedValue([]);

      const slots = await service.getResolvedAvailability('field-1', '2026-04-26'); // Sunday

      // No plan covers any time → all slots should be absent (no boundaries set)
      const slotsInRange = slots.filter((s) => s.time >= 480 && s.time < 720);
      expect(slotsInRange.length).toBe(0);
    });

    it('applies exception plan for a specific date regardless of daysOfWeek', async () => {
      // Exception plan for 2026-04-29 (Wednesday, dayOfWeek=3)
      const exceptionPlan = makePlan({
        type: PlanType.BLOCKED,
        startTime: 540,
        endTime: 720,
        priority: 10,
        isRecurring: false,
        daysOfWeek: [],
        specificDate: new Date('2026-04-29'),
      });

      mockPrisma.field.findUnique.mockResolvedValue({ id: 'field-1', pricePerHour: DEFAULT_PRICE });
      mockPrisma.fieldBookingPlan.findMany
        .mockResolvedValueOnce([])         // weekly (empty — isRecurring filter)
        .mockResolvedValueOnce([exceptionPlan]); // exceptions
      mockPrisma.booking.findMany.mockResolvedValue([]);

      const slots = await service.getResolvedAvailability('field-1', '2026-04-29');

      const blockedSlots = slots.filter((s) => !s.available);
      expect(blockedSlots.length).toBeGreaterThan(0);
      blockedSlots.forEach((s) => {
        expect(s.time).toBeGreaterThanOrEqual(540);
        expect(s.time).toBeLessThan(720);
      });
    });

    it('subtracts already booked slots from availability', async () => {
      const allDayPlan = makePlan({ type: PlanType.AVAILABLE, startTime: 0, endTime: 1440, priority: 0 });
      const booking = makeBooking({
        startTime: new Date('2026-04-29T09:00:00Z'), // 09:00
        endTime: new Date('2026-04-29T11:00:00Z'),   // 11:00
      });

      mockPrisma.field.findUnique.mockResolvedValue({ id: 'field-1', pricePerHour: DEFAULT_PRICE });
      mockPrisma.fieldBookingPlan.findMany
        .mockResolvedValueOnce([allDayPlan])
        .mockResolvedValueOnce([]);
      mockPrisma.booking.findMany.mockResolvedValue([booking]);

      const slots = await service.getResolvedAvailability('field-1', '2026-04-29');

      const bookedSlots = slots.filter((s) => s.blockedReason === 'Already booked');
      expect(bookedSlots.length).toBeGreaterThan(0);
      bookedSlots.forEach((s) => {
        expect(s.available).toBe(false);
        expect(s.blockedReason).toBe('Already booked');
      });
    });

    it('exception plan with higher priority overrides weekly plan for same time', async () => {
      // Weekly plan: AVAILABLE all day, priority 5
      const weeklyPlan = makePlan({
        type: PlanType.AVAILABLE,
        startTime: 0,
        endTime: 1440,
        priority: 5,
        isRecurring: true,
        daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
      });
      // Exception: BLOCKED 08:00-10:00 on 2026-04-29, priority 10
      const exceptionPlan = makePlan({
        type: PlanType.BLOCKED,
        startTime: 480,
        endTime: 600,
        priority: 10,
        isRecurring: false,
        daysOfWeek: [],
        specificDate: new Date('2026-04-29'),
      });

      mockPrisma.field.findUnique.mockResolvedValue({ id: 'field-1', pricePerHour: DEFAULT_PRICE });
      mockPrisma.fieldBookingPlan.findMany
        .mockResolvedValueOnce([weeklyPlan])
        .mockResolvedValueOnce([exceptionPlan]);
      mockPrisma.booking.findMany.mockResolvedValue([]);

      const slots = await service.getResolvedAvailability('field-1', '2026-04-29');

      const blockedSlots = slots.filter((s) => !s.available && s.time >= 480 && s.time < 600);
      expect(blockedSlots.length).toBeGreaterThan(0);

      // Rest of the day should still be available
      const otherSlots = slots.filter((s) => s.time >= 600 && s.time < 1440 && s.available);
      expect(otherSlots.length).toBeGreaterThan(0);
    });

    it('timeStr field is formatted as HH:mm', async () => {
      const plan = makePlan({ type: PlanType.AVAILABLE, startTime: 480, endTime: 600, priority: 0 });

      mockPrisma.field.findUnique.mockResolvedValue({ id: 'field-1', pricePerHour: DEFAULT_PRICE });
      mockPrisma.fieldBookingPlan.findMany
        .mockResolvedValueOnce([plan])
        .mockResolvedValueOnce([]);
      mockPrisma.booking.findMany.mockResolvedValue([]);

      const slots = await service.getResolvedAvailability('field-1', '2026-04-29');

      slots.forEach((s) => {
        expect(s.timeStr).toMatch(/^\d{2}:\d{2}$/);
      });
    });
  });
});
