// ── Enums ────────────────────────────────────────────────────────────

export type PlanType = 'AVAILABLE' | 'BLOCKED' | 'CUSTOM_PRICE';

// ── Core Domain ──────────────────────────────────────────────────────

export interface FieldBookingPlan {
  id: string;
  fieldId: string;
  type: PlanType;
  priority: number;
  startTime: number; // minutes from 00:00, e.g. 480 = 08:00
  endTime: number;   // minutes from 00:00, e.g. 1080 = 18:00
  timezone: string;
  isRecurring: boolean;
  daysOfWeek: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  specificDate: string | null; // ISO date string
  priceOverride: number | null; // VND
  createdAt: string;
  updatedAt: string;
}

export interface BookingPlansResponse {
  weekly: FieldBookingPlan[];
  exceptions: FieldBookingPlan[];
}

// ── Availability ─────────────────────────────────────────────────────

export interface ResolvedSlot {
  time: number;       // minutes from midnight
  timeStr: string;     // e.g. "08:00"
  available: boolean;
  price: number;       // VND
  blockedReason?: string;
}

// ── DTOs ─────────────────────────────────────────────────────────────

export interface CreatePlanDto {
  type: PlanType;
  priority?: number;
  startTime: number;
  endTime: number;
  timezone?: string;
  isRecurring?: boolean;
  daysOfWeek?: number[];
  specificDate?: string;
  priceOverride?: number;
}

export interface UpdatePlanDto {
  type?: PlanType;
  priority?: number;
  startTime?: number;
  endTime?: number;
  timezone?: string;
  isRecurring?: boolean;
  daysOfWeek?: number[];
  specificDate?: string;
  priceOverride?: number;
}

// ── UI helpers ───────────────────────────────────────────────────────

export interface DayLabel {
  value: number; // 0-6
  short: string; // "T2"
  full: string;  // "Thứ Hai"
}

export const DAY_LABELS: DayLabel[] = [
  { value: 0, short: 'CN',  full: 'Chủ Nhật' },
  { value: 1, short: 'T2',  full: 'Thứ Hai' },
  { value: 2, short: 'T3',  full: 'Thứ Ba' },
  { value: 3, short: 'T4',  full: 'Thứ Tư' },
  { value: 4, short: 'T5',  full: 'Thứ Năm' },
  { value: 5, short: 'T6',  full: 'Thứ Sáu' },
  { value: 6, short: 'T7',  full: 'Thứ Bảy' },
];

export const PLAN_TYPE_CONFIG = {
  AVAILABLE: {
    label: 'Mở bán',
    color: 'bg-green-100 border-green-300 text-green-800',
    dotColor: 'bg-green-500',
  },
  BLOCKED: {
    label: 'Đóng/Bloc k',
    color: 'bg-red-100 border-red-300 text-red-800',
    dotColor: 'bg-red-500',
  },
  CUSTOM_PRICE: {
    label: 'Giá đặc biệt',
    color: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    dotColor: 'bg-yellow-500',
  },
} as const;

export const DEFAULT_TIMEZONE = 'Asia/Ho_Chi_Minh';
export const SLOT_DURATION_MINUTES = 30; // each grid slot = 30 min

/**
 * Convert minutes (e.g. 480) to a "HH:mm" string.
 */
export function minutesToTimeStr(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Convert "HH:mm" to minutes from midnight.
 */
export function timeStrToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Format VND number for display.
 */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
}

/**
 * Get day-of-week from an ISO date string.
 */
export function getDayOfWeek(dateStr: string): number {
  return new Date(dateStr).getDay();
}

/**
 * Day labels sorted Mon-first.
 */
export const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;
