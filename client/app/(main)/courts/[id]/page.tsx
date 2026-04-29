'use client';

import { useMemo, useState, use } from 'react';
import Image from 'next/image';
import { MapPin, Star, ChevronLeft, ChevronRight, Calendar, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useCourt } from '@/hooks/use-courts';
import { useFieldAvailability } from '@/hooks/use-fields';
import { useCreateBooking } from '@/hooks/use-bookings';
import tienMinh from '@/assets/tienminh.webp';
import type { ApiField, ApiTimeSlot } from '@/types/court';
import { HomeNavbar } from '@/components/home/navbar';
import { Footer } from '@/components/home/footer';

// ─── helpers ────────────────────────────────────────────────────────────────

function getWeekDays(base: Date): Date[] {
    const monday = new Date(base);
    monday.setDate(base.getDate() - ((base.getDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d;
    });
}

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

function SlotLabel({ slot }: { slot: ApiTimeSlot }) {
    return (
        <span className="font-semibold text-gray-700">
            {formatSlotTime(slot.startTime)} - {formatSlotTime(slot.endTime)}
        </span>
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
    const createBooking = useCreateBooking();
    const queryClient = useQueryClient();
    const { data: slots, isLoading: slotsLoading } = useFieldAvailability(selectedFieldId, dateStr);

    const weekDays = getWeekDays(weekBase);

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

    async function handleBook() {
        if (!selectedSlot || !selectedFieldId) return;
        setBookingError(null);
        setBookingSuccess(false);
        try {
            await createBooking.mutateAsync({
                fieldId: selectedFieldId,
                timeSlotId: selectedSlot.id,
                date: dateStr,
            });
            setBookingSuccess(true);
            setSelectedSlot(null);
        } catch (err: any) {
            const status = err?.response?.status;
            const msg = err?.response?.data?.message;
            if (status === 409 || err?.response?.data?.code === 'P2002') {
                setBookingError('Slot đã được đặt hoặc đang chờ xử lý. Vui lòng chọn giờ khác.');
            } else {
                setBookingError(msg ?? 'Đặt sân thất bại. Vui lòng thử lại.');
            }
        }
    }

    const fields = useMemo(() => court?.fields ?? [], [court?.fields]);
    const selectedField: ApiField | undefined = fields.find((f) => f.id === selectedFieldId);

    const allFeatures = useMemo(() => {
        return Array.from(new Set(fields.flatMap((f) => f.features ?? [])));
    }, [fields]);

    const amenities = selectedFieldId && selectedField ? selectedField.features ?? [] : allFeatures;

    const SERVICE_FEE = 5000;
    const pricePerHour = selectedField?.pricePerHour ?? 0;

    const formattedDate = selectedDay.toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

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
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-semibold text-gray-800">Lịch đặt sân</h2>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={prevWeek}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                    aria-label="Tuần trước"
                                >
                                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                                </button>
                                <button
                                    onClick={nextWeek}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                    aria-label="Tuần sau"
                                >
                                    <ChevronRight className="w-4 h-4 text-gray-600" />
                                </button>
                            </div>
                        </div>

                        {/* Week header */}
                        <div className="grid grid-cols-7 gap-1 mb-3">
                            {weekDays.map((day, i) => {
                                const isSelected = day.toDateString() === selectedDay.toDateString();
                                const isToday = day.toDateString() === today.toDateString();
                                return (
                                    <button
                                        key={day.toISOString()}
                                        onClick={() => {
                                            setSelectedDay(day);
                                            setSelectedSlot(null);
                                        }}
                                        className={[
                                            'flex flex-col items-center py-2 rounded-lg text-xs transition-colors',
                                            isSelected
                                                ? 'bg-[#0F6E56] text-white'
                                                : isToday
                                                    ? 'border border-[#0F6E56] text-[#0F6E56]'
                                                    : 'hover:bg-gray-50 text-gray-600',
                                        ].join(' ')}
                                    >
                                        <span className="font-medium">{DAY_LABELS[i]}</span>
                                        <span className={`text-sm font-bold mt-0.5 ${isSelected ? 'text-white' : ''}`}>
                                            {day.getDate()}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Time slots grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                            {slotsLoading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="h-14 rounded-lg bg-gray-100 animate-pulse" />
                                ))
                            ) : !selectedFieldId ? (
                                <p className="col-span-3 text-center text-sm text-gray-400 py-6">
                                    Vui lòng chọn sân (field) để xem khung giờ trống.
                                </p>
                            ) : !slots || slots.length === 0 ? (
                                <p className="col-span-3 text-center text-sm text-gray-400 py-6">
                                    Không có khung giờ trống trong ngày này.
                                </p>
                            ) : (
                                slots.map((slot) => {
                                    const isSelected = selectedSlot?.id === slot.id;
                                    const isPast = isPastSlot(slot, selectedDay);
                                    const slotStatus = slot.status ?? 'AVAILABLE';
                                    const isBooked = slotStatus !== 'AVAILABLE';

                                    let statusBg = '';
                                    let statusBorder = 'border-gray-200';
                                    let statusTextColor = 'text-green-600';
                                    let dotColor = 'bg-green-500';
                                    let statusLabel = 'Còn trống';

                                    if (isPast) {
                                        statusBg = 'bg-gray-50 opacity-50';
                                        statusBorder = 'border-gray-200';
                                        statusTextColor = 'text-gray-400';
                                        dotColor = 'bg-gray-400';
                                        statusLabel = 'Đã qua giờ';
                                    } else if (slotStatus === 'PENDING') {
                                        statusBg = 'bg-amber-50';
                                        statusBorder = 'border-amber-300';
                                        statusTextColor = 'text-amber-600';
                                        dotColor = 'bg-amber-400';
                                        statusLabel = 'Chờ xác nhận';
                                    } else if (slotStatus === 'CONFIRMED') {
                                        statusBg = 'bg-red-50';
                                        statusBorder = 'border-red-200';
                                        statusTextColor = 'text-red-500';
                                        dotColor = 'bg-red-400';
                                        statusLabel = 'Đã đặt';
                                    }

                                    return (
                                        <button
                                            key={slot.id}
                                            disabled={isPast || isBooked}
                                            onClick={() => setSelectedSlot(isSelected ? null : slot)}
                                            className={[
                                                'flex flex-col items-start px-3 py-2 rounded-lg border text-xs transition-all',
                                                isPast ? 'cursor-not-allowed' : isBooked ? 'cursor-not-allowed' : '',
                                                isSelected
                                                    ? 'border-[#0F6E56] bg-[#E8F5F0]'
                                                    : `${statusBg} hover:${statusBorder} border-gray-200`,
                                            ].join(' ')}
                                        >
                                            <SlotLabel slot={slot} />
                                            <span className={`text-xs ${statusTextColor} flex items-center gap-1 mt-0.5`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${dotColor} inline-block`} />
                                                {isPast ? 'Đã qua giờ' : statusLabel}
                                            </span>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                
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
                                        let textColor = 'text-gray-600';

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
