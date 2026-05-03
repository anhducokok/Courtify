'use client';

import { useMemo, useState, use, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MapPin, Star, ChevronLeft, ChevronRight, Calendar, Loader2, Clock } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useCourt } from '@/hooks/use-courts';
import { useFieldAvailability, useDayFieldAvailabilities } from '@/hooks/use-fields';
import { useCreateBooking } from '@/hooks/use-bookings';
import { useBooking } from '@/components/booking/booking-context';
import tienMinh from '@/assets/tienminh.webp';
import type { ApiField, ApiTimeSlot } from '@/types/court';
import { HomeNavbar } from '@/components/home/navbar';
import { Footer } from '@/components/home/footer';

// ─── helpers ────────────────────────────────────────────────────────────────

const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

function formatSlotTime(iso: string) {
    return new Date(iso).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
}

function isPastSlot(slot: ApiTimeSlot, day: Date) {
    const now = new Date();
    const selected = new Date(day);
    selected.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selected < today) return true;
    if (selected > today) return false;

    const start = new Date(slot.startTime);
    const slotStart = new Date(day);
    slotStart.setHours(start.getHours(), start.getMinutes(), 0, 0);

    return slotStart <= now;
}

// ─── Resource Scheduling Calendar ─────────────────────────────────────────────
// X-axis = time (00:00–24:00), Y-axis = fields (Sân 1, Sân 2…)

const GRID_START_MINUTE = 0;       // 00:00
const GRID_END_MINUTE   = 24 * 60;  // 24:00 (1440 min)
const HOUR_WIDTH        = 80;       // px per hour
const ROW_HEIGHT        = 64;       // px per field row

function getHourLabel(hour: number) {
    return `${String(hour).padStart(2, '0')}:00`;
}

function getMinutesSinceMidnight(iso: string): number {
    const d = new Date(iso);
    return d.getHours() * 60 + d.getMinutes();
}

// ── Position a slot horizontally ─────────────────────────────────────────────
// left = startMinutes / 1440,  width = durationMinutes / 1440
function slotPosition(slot: ApiTimeSlot): { leftPct: number; widthPct: number } {
    const startMin = getMinutesSinceMidnight(slot.startTime);
    const endMin   = (() => {
        const e = new Date(slot.endTime);
        const s = new Date(slot.startTime);
        // Cross-midnight: clamp to end of day so block stops at 23:59
        if (e.getDate() !== s.getDate()) {
            return 24 * 60 - 1;
        }
        return e.getHours() * 60 + e.getMinutes();
    })();
    const duration = Math.max(endMin - startMin, 5);
    return {
        leftPct:  (startMin / 1440) * 100,
        widthPct: (duration  / 1440) * 100,
    };
}

function TimelineGrid({
    fields,
    fieldSlots,
    slotsLoading,
    selectedDay,
    selectedSlot,
    onSelectSlot,
}: {
    fields: { id: string; name: string }[];
    fieldSlots: { field: { id: string; name: string }; slots: ApiTimeSlot[] }[];
    slotsLoading: boolean;
    selectedDay: Date;
    selectedSlot: ApiTimeSlot | null;
    onSelectSlot: (slot: ApiTimeSlot | null) => void;
}) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const totalMinutes = GRID_END_MINUTE - GRID_START_MINUTE;
    const gridWidth    = (totalMinutes / 60) * HOUR_WIDTH;
    const totalHours   = totalMinutes / 60;

    const hours = useMemo(
        () => Array.from({ length: totalHours + 1 }, (_, i) => i),
        [totalHours],
    );

    // Scroll to current time on mount
    useEffect(() => {
        if (!scrollRef.current) return;
        const now = new Date();
        const currentMin = now.getHours() * 60 + now.getMinutes();
        const scrollLeft = (currentMin / totalMinutes) * gridWidth - 80;
        scrollRef.current.scrollLeft = Math.max(0, scrollLeft);
    }, [gridWidth, totalMinutes]);

    const today = new Date();
    const isToday = selectedDay.toDateString() === today.toDateString();
    const isPastDay = (() => {
        const todayStart = new Date(today);
        todayStart.setHours(0, 0, 0, 0);
        return selectedDay < todayStart;
    })();

    const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
        past:      { bg: 'bg-gray-100',       text: 'text-gray-400', label: 'Đã qua' },
        pending:   { bg: 'bg-amber-100',      text: 'text-amber-800', label: 'Chờ xác nhận' },
        confirmed: { bg: 'bg-blue-500',       text: 'text-white',     label: 'Đã đặt' },
        available: { bg: 'bg-emerald-50',     text: 'text-emerald-700', label: 'Còn trống' },
    };

    const nowPct = (() => {
        if (!isToday) return null;
        const nowMin = today.getHours() * 60 + today.getMinutes();
        return (nowMin / 1440) * 100;
    })();

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* ── Header: sticky ──────────────────────────────────────────────── */}
            <div className="flex border-b border-gray-200 bg-gray-50/90 sticky top-0 z-20">
                {/* Left: field-name column */}
                <div className="w-20 shrink-0 border-r border-gray-200 flex items-center justify-center">
                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Sân</span>
                </div>

                {/* Time axis */}
                <div className="relative overflow-hidden" style={{ width: `${gridWidth}px`, minWidth: `${gridWidth}px` }}>
                    {hours.map((h) => (
                        <div
                            key={h}
                            className="absolute top-0 bottom-0 flex items-start justify-end"
                            style={{ left: `${h * HOUR_WIDTH}px`, width: `${HOUR_WIDTH}px` }}
                        >
                            <span className="text-[10px] text-gray-400 font-medium pr-1 mt-1">
                                {getHourLabel(h)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Body ─────────────────────────────────────────────────────────── */}
            <div ref={scrollRef} className="overflow-auto" style={{ maxHeight: '420px' }}>
                <div className="flex" style={{ width: `${20 * 16 + gridWidth}px`, minWidth: '100%' }}>
                    {/* Left: field-name column */}
                    <div className="w-20 shrink-0 border-r border-gray-200 bg-gray-50/50">
                        {fields.map((f) => (
                            <div
                                key={f.id}
                                className="flex items-center justify-center border-b border-gray-100 last:border-b-0 bg-white"
                                style={{ height: `${ROW_HEIGHT}px` }}
                            >
                                <span className="text-xs font-semibold text-gray-700 truncate px-1 text-center">
                                    {f.name}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Time grid (shared background for all fields) */}
                    <div
                        className="relative flex-1"
                        style={{ height: `${fields.length * ROW_HEIGHT}px` }}
                    >
                        {/* Hour vertical lines */}
                        {hours.map((h) => (
                            <div
                                key={h}
                                className="absolute top-0 bottom-0 border-l border-gray-100"
                                style={{ left: `${h * HOUR_WIDTH}px` }}
                            />
                        ))}

                        {/* Half-hour faint lines */}
                        {hours.slice(0, -1).map((h) => (
                            <div
                                key={`half-${h}`}
                                className="absolute top-0 bottom-0 border-l border-gray-100/40"
                                style={{ left: `${h * HOUR_WIDTH + HOUR_WIDTH / 2}px` }}
                            />
                        ))}

                        {/* Current-time indicator */}
                        {nowPct !== null && (
                            <div
                                className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
                                style={{ left: `${nowPct}%` }}
                            >
                                <div className="w-2 h-2 rounded-full bg-red-500 absolute -top-1 -left-[5px]" />
                            </div>
                        )}

                        {/* Field row dividers */}
                        {fields.map((_, i) => (
                            <div
                                key={`row-${i}`}
                                className="absolute left-0 right-0 border-t border-gray-200"
                                style={{ top: `${i * ROW_HEIGHT}px` }}
                            />
                        ))}

                        {/* Loading skeleton */}
                        {slotsLoading && fields.map((f) => (
                            <div
                                key={`skel-${f.id}`}
                                className="absolute left-1 bg-gray-100 rounded animate-pulse"
                                style={{
                                    top:    `${fields.indexOf(f) * ROW_HEIGHT + 4}px`,
                                    height: `${ROW_HEIGHT - 8}px`,
                                    width:  '25%',
                                }}
                            />
                        ))}

                        {/* Booking blocks */}
                        {!slotsLoading && fields.map((f, fieldIdx) => {
                            const fieldData = fieldSlots.find((fs) => fs.field.id === f.id);
                            const daySlots  = fieldData?.slots ?? [];

                            return (
                                <div key={f.id} className="contents">
                                    {daySlots.map((slot) => {
                                        const endD = new Date(slot.endTime);
                                        const isPastSlot = isPastDay
                                            || (isToday && endD <= today);

                                        const status = isPastSlot ? 'past'
                                            : slot.status === 'PENDING'  ? 'pending'
                                            : slot.status === 'CONFIRMED' ? 'confirmed'
                                            : 'available';

                                        const st         = STATUS_STYLES[status];
                                        const isSelected = selectedSlot?.id === slot.id;
                                        const { leftPct, widthPct } = slotPosition(slot);

                                        return (
                                            <div
                                                key={slot.id}
                                                onClick={() => {
                                                    if (status === 'past') return;
                                                    onSelectSlot(isSelected ? null : slot);
                                                }}
                                                style={{
                                                    position: 'absolute',
                                                    left:   `calc(${leftPct}% + 1px)`,
                                                    width:  `calc(${widthPct}% - 2px)`,
                                                    top:    `${fieldIdx * ROW_HEIGHT + 3}px`,
                                                    height: `${ROW_HEIGHT - 6}px`,
                                                }}
                                                className={[
                                                    'rounded-md border px-2 py-1 flex flex-col justify-center overflow-hidden',
                                                    'transition-all cursor-pointer',
                                                    st.bg,
                                                    status === 'past' ? 'cursor-not-allowed opacity-50' : '',
                                                    isSelected ? 'ring-2 ring-yellow-400 ring-offset-1' : '',
                                                ].join(' ')}
                                            >
                                                <span className={`text-[10px] font-semibold leading-tight truncate ${st.text}`}>
                                                    {formatSlotTime(slot.startTime)} – {formatSlotTime(slot.endTime)}
                                                </span>
                                                <span className={`text-[9px] font-medium ${st.text} opacity-80 truncate mt-0.5`}>
                                                    {st.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Calendar Section ────────────────────────────────────────────────────

function CalendarSection({
    fields,
    fieldSlots,
    slotsLoading,
    selectedDay,
    selectedSlot,
    selectedFieldId,
    onSelectDay,
    onSelectSlot,
    weekDays,
    prevWeek,
    nextWeek,
}: {
    fields: { id: string; name: string }[];
    fieldSlots: { field: { id: string; name: string }; slots: ApiTimeSlot[] }[];
    slotsLoading: boolean;
    selectedDay: Date;
    selectedSlot: ApiTimeSlot | null;
    selectedFieldId: string | undefined;
    onSelectDay: (d: Date) => void;
    onSelectSlot: (slot: ApiTimeSlot | null) => void;
    weekDays: Date[];
    prevWeek: () => void;
    nextWeek: () => void;
}) {
    const today = new Date();
    const todayStr = today.toDateString();

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-gray-800">Lịch đặt sân</h2>
                <div className="flex items-center gap-1">
                    <button
                        onClick={prevWeek}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Tuần trước"
                    >
                        <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    <span className="text-xs text-gray-500 font-medium px-2">
                        {selectedDay.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </span>
                    <button
                        onClick={nextWeek}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Tuần sau"
                    >
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Day header row */}
            <div className="grid grid-cols-[56px_repeat(7,1fr)] gap-0 mb-1 border border-gray-200 rounded-lg overflow-hidden">
                {/* Top-left corner spacer */}
                <div className="bg-gray-50 border-r border-gray-200" />

                {weekDays.map((day, i) => {
                    const isSelected = day.toDateString() === selectedDay.toDateString();
                    const isToday = day.toDateString() === todayStr;
                    return (
                        <button
                            key={day.toISOString()}
                            onClick={() => onSelectDay(day)}
                            className={[
                                'flex flex-col items-center py-2 text-xs transition-colors',
                                isSelected
                                    ? 'bg-[#0F6E56] text-white'
                                    : isToday
                                        ? 'bg-[#0F6E56]/10 text-[#0F6E56] font-semibold'
                                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100',
                            ].join(' ')}
                        >
                            <span className="font-medium">{DAY_LABELS[i]}</span>
                            <span className={`text-sm font-bold ${isSelected ? 'text-white' : ''}`}>
                                {day.getDate()}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mb-3 mt-2">
                <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-emerald-50 border border-emerald-200 inline-block" />
                    <span className="text-[10px] text-gray-500">Còn trống</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-amber-100 border border-amber-200 inline-block" />
                    <span className="text-[10px] text-gray-500">Chờ xác nhận</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-blue-500 inline-block" />
                    <span className="text-[10px] text-gray-500">Đã đặt</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-gray-100 inline-block" />
                    <span className="text-[10px] text-gray-500">Đã qua</span>
                </div>
            </div>

            {/* Timeline grid */}
            {!selectedFieldId || fields.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-sm text-gray-400 gap-2">
                    <Clock className="w-4 h-4" />
                    Vui lòng chọn sân (field) để xem lịch.
                </div>
            ) : (
                <TimelineGrid
                    fields={fields}
                    fieldSlots={fieldSlots}
                    slotsLoading={slotsLoading}
                    selectedDay={selectedDay}
                    selectedSlot={selectedSlot}
                    onSelectSlot={onSelectSlot}
                />
            )}
        </div>
    );
}



// ─── Page ───────────────────────────────────────────────────────────────────

export default function CourtDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const today = new Date();
    const [weekBase, setWeekBase] = useState(today);
    const [selectedDay, setSelectedDay] = useState(today);
    const [selectedSlot, setSelectedSlot] = useState<ApiTimeSlot | null>(null);
    const [selectedFieldId, setSelectedFieldId] = useState<string | undefined>(undefined);
    const [bookingError, setBookingError] = useState<string | null>(null);
    const [bookingSuccess, setBookingSuccess] = useState(false);

    const dateStr = selectedDay.toISOString().split('T')[0];
    const { data: court, isLoading } = useCourt(id, dateStr);
    const fields = useMemo(() => court?.fields ?? [], [court?.fields]);
    const router = useRouter();
    const { updateCourt, setBookingId } = useBooking();
    const createBooking = useCreateBooking();
    const queryClient = useQueryClient();
    const { data: slots, isLoading: slotsLoading } = useFieldAvailability(selectedFieldId, dateStr);

    // Derive week days from weekBase (Mon–Sun)
    const dow = (weekBase.getDay() + 6) % 7;
    const weekStart = new Date(weekBase);
    weekStart.setDate(weekStart.getDate() - dow);
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        return d;
    });

    const { data: fieldSlots, isLoading: fieldSlotsLoading } = useDayFieldAvailabilities(
        fields,
        dateStr,
    );

    function prevWeek() {
        const d = new Date(weekBase);
        d.setDate(d.getDate() - 7);
        setWeekBase(d);
    }
    function nextWeek() {
        const d = new Date(weekBase);
        d.setDate(d.getDate() + 7);
        setWeekBase(d);
    }

    const selectedField: ApiField | undefined = fields.find((f) => f.id === selectedFieldId);

    const formattedDate = selectedDay.toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

    async function handleBook() {
        if (!selectedSlot || !selectedFieldId) return;
        setBookingError(null);
        setBookingSuccess(false);
        try {
            const booking = await createBooking.mutateAsync({
                fieldId: selectedFieldId,
                timeSlotId: selectedSlot.id,
                date: dateStr,
            });
            setBookingId(booking.id);
            updateCourt({
                venueName: court?.name ?? '',
                courtName: selectedField?.name ?? '',
                address: court?.location ?? '',
                fieldId: selectedFieldId,
                fieldName: selectedField?.name ?? '',
                timeSlotId: selectedSlot.id,
                date: formattedDate,
                time: `${formatSlotTime(selectedSlot.startTime)} – ${formatSlotTime(selectedSlot.endTime)}`,
                duration: '1 giờ',
            });
            router.push('/booking/info');
        } catch (err) {
            const status = (err as { response?: { status?: number; data?: { message?: string; code?: string } } })?.response?.status;
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            const code = (err as { response?: { data?: { code?: string } } })?.response?.data?.code;
            if (status === 409 || code === 'P2002') {
                setBookingError('Slot đã được đặt hoặc đang chờ xử lý. Vui lòng chọn giờ khác.');
            } else {
                setBookingError(msg ?? 'Đặt sân thất bại. Vui lòng thử lại.');
            }
        }
    }

    const allFeatures = useMemo(() => {
        return Array.from(new Set(fields.flatMap((f) => f.features ?? [])));
    }, [fields]);

    const amenities = selectedFieldId && selectedField ? selectedField.features ?? [] : allFeatures;

    const SERVICE_FEE = 5000;
    const pricePerHour = selectedField?.pricePerHour ?? 0;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-4 border-[#0F6E56] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            <HomeNavbar />
            {/* ── Hero ──────────────────────────────────────────────────────────── */}
            <div className="relative h-56 md:h-72 w-full overflow-hidden">
                <Image
                    src={tienMinh}
                    alt={court?.name ?? 'Court'}
                    fill
                    sizes="100vw"
                    className="object-cover object-top"
                    priority
                />
                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* Hero content */}
                <div className="absolute bottom-0 left-0 right-0 px-6 pb-5 text-white">
                    <div className="flex items-center gap-1 mb-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold">{court?.averageRating?.toFixed(1) ?? '4.8'}</span>
                        <span className="text-xs text-gray-300">({court?.reviewCount ?? 120} đánh giá)</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold leading-tight">{court?.name ?? '—'}</h1>
                    <div className="flex items-center gap-1 mt-1 text-gray-200 text-sm">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>{court?.location ?? '—'}</span>
                    </div>
                </div>
            </div>

            {/* ── Body ──────────────────────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
                {/* ── Left column ─────────────────────────────────────────────────── */}
                <div className="flex-1 min-w-0 flex flex-col gap-6">
                    {/* Amenity tags */}
                    <div className="flex flex-wrap gap-2">
                        {amenities.length === 0 ? (
                            <span className="text-sm text-gray-400">Chưa có thông tin tiện ích.</span>
                        ) : (
                            amenities.map((tag) => (
                            <span
                                key={tag}
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#E8F5F0] text-[#0F6E56] border border-[#0F6E56]/20"
                            >
                                {tag}
                            </span>
                            ))
                        )}
                    </div>

                    {/* Calendar section */}
                    <CalendarSection
                        fields={fields}
                        fieldSlots={fieldSlots ?? []}
                        slotsLoading={fieldSlotsLoading}
                        selectedDay={selectedDay}
                        selectedSlot={selectedSlot}
                        selectedFieldId={selectedFieldId}
                        onSelectDay={(d) => {
                            setSelectedDay(d);
                            setSelectedSlot(null);
                        }}
                        onSelectSlot={(slot) => setSelectedSlot(slot)}
                        weekDays={weekDays}
                        prevWeek={prevWeek}
                        nextWeek={nextWeek}
                    />

                
                </div>

                {/* ── Right column – Booking sidebar ─────────────────────────────── */}
                <div className="w-full lg:w-80 shrink-0">
                    <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-20">
                        <h2 className="text-base font-semibold text-gray-800 mb-4">Chi tiết đặt sân</h2>

                        {/* Date */}
                        <div className="mb-4">
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
                                Ngày đặt
                            </p>
                            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2">
                                <Calendar className="w-4 h-4 text-[#0F6E56]" />
                                <span className="text-sm text-gray-700 capitalize">{formattedDate}</span>
                            </div>
                        </div>

                        {/* Field selection */}
                        <div className="mb-4">
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
                                Chọn sân (field)
                            </p>
                            {fields.length === 0 ? (
                                <p className="text-xs text-gray-400">Sân này chưa có field.</p>
                            ) : (
                                <div className="grid grid-cols-1 gap-2">
                                    {fields.map((f) => {
                                        const isSelected = f.id === selectedFieldId;
                                        const isPastDate = (() => {
                                            const selected = new Date(selectedDay);
                                            selected.setHours(0, 0, 0, 0);
                                            const todayDate = new Date();
                                            todayDate.setHours(0, 0, 0, 0);
                                            return selected < todayDate;
                                        })();

                                        return (
                                            <button
                                                key={f.id}
                                                type="button"
                                                disabled={isPastDate}
                                                onClick={() => {
                                                    setSelectedFieldId(f.id);
                                                    setSelectedSlot(null);
                                                    queryClient.invalidateQueries({ queryKey: ['field-availability'] });
                                                    setBookingSuccess(false);
                                                    setBookingError(null);
                                                }}
                                                className={[
                                                    'w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-all',
                                                    isPastDate ? 'bg-gray-600 border-gray-500 cursor-not-allowed' : 'bg-white border-gray-200 hover:border-[#0F6E56]/50 cursor-pointer',
                                                    isSelected && !isPastDate ? 'border-2 border-[#0F6E56] shadow-sm' : '',
                                                ].join(' ')}
                                            >
                                                <div className="flex-1 text-left">
                                                    <span className={`font-medium truncate ${isPastDate ? 'text-gray-100' : 'text-gray-700'}`}>{f.name}</span>
                                                    {isPastDate && (
                                                        <span className="text-[10px] text-gray-300 block mt-0.5">Quá giờ</span>
                                                    )}
                                                </div>
                                                <span className={`text-xs shrink-0 ${isPastDate ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    {Number(f.pricePerHour).toLocaleString('vi-VN')}đ/giờ
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Time selection */}
                        <div className="mb-5">
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
                                Thời gian
                            </p>
                            {slotsLoading ? (
                                <div className="grid grid-cols-2 gap-2">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className="h-8 rounded-lg bg-gray-100 animate-pulse" />
                                    ))}
                                </div>
                            ) : !selectedFieldId ? (
                                <p className="text-xs text-gray-400">Hãy chọn sân (field) để xem khung giờ trống.</p>
                            ) : !slots || slots.length === 0 ? (
                                <p className="text-xs text-gray-400">Không có khung giờ trống.</p>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    {slots.slice(0, 6).map((slot) => {
                                        const isSelected = selectedSlot?.id === slot.id;
                                        const isPast = isPastSlot(slot, selectedDay);
                                        const slotStatus = slot.status ?? 'AVAILABLE';
                                        const isBooked = slotStatus !== 'AVAILABLE';

                                        let statusBg = '';
                                        const textColor = 'text-gray-600';

                                        if (isPast) {
                                            statusBg = 'bg-gray-50 text-gray-400 cursor-not-allowed';
                                        } else if (slotStatus === 'PENDING') {
                                            statusBg = 'bg-amber-50 text-amber-600 cursor-not-allowed';
                                        } else if (slotStatus === 'CONFIRMED') {
                                            statusBg = 'bg-red-50 text-red-400 cursor-not-allowed';
                                        }

                                        return (
                                            <button
                                                key={slot.id}
                                                disabled={isPast || isBooked}
                                                onClick={() => setSelectedSlot(isSelected ? null : slot)}
                                                className={[
                                                    'py-1.5 px-2 rounded-lg text-xs font-medium border transition-all',
                                                    isPast
                                                        ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                                        : isBooked
                                                            ? statusBg
                                                            : '',
                                                    isSelected
                                                        ? 'border-[#0F6E56] bg-[#0F6E56] text-white'
                                                        : `border-gray-200 ${!isPast && !isBooked ? 'text-gray-600 hover:border-[#0F6E56]/60' : textColor}`,
                                                ].join(' ')}
                                            >
                                                {formatSlotTime(slot.startTime)} - {formatSlotTime(slot.endTime)}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Price breakdown */}
                        <div className="border-t border-gray-100 pt-4 flex flex-col gap-2 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Tiền sân (1 giờ)</span>
                                <span>{pricePerHour.toLocaleString('vi-VN')}đ</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Phí dịch vụ</span>
                                <span>{SERVICE_FEE.toLocaleString('vi-VN')}đ</span>
                            </div>
                            <div className="flex justify-between font-bold text-gray-800 mt-1 pt-2 border-t border-gray-100">
                                <span>Tổng cộng</span>
                                <span className="text-[#0F6E56]">
                                    {(pricePerHour + SERVICE_FEE).toLocaleString('vi-VN')}đ
                                </span>
                            </div>
                        </div>

                        {/* CTA */}
                        {bookingSuccess && (
                            <p className="mt-3 text-sm text-center text-green-600 font-medium">
                                Đặt sân thành công!
                            </p>
                        )}
                        {bookingError && (
                            <p className="mt-3 text-sm text-center text-red-500">{bookingError}</p>
                        )}
                        <button
                            disabled={!selectedSlot || !selectedFieldId || createBooking.isPending}
                            onClick={handleBook}
                            className="mt-4 w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2
                bg-[#0F6E56] text-white hover:bg-[#0D5E49] disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {createBooking.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            Đặt sân
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
