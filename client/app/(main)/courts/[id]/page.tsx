'use client';

import { useState, use, useContext } from 'react';
import Image from 'next/image';
import { MapPin, Star, ChevronLeft, ChevronRight, Calendar, Loader2 } from 'lucide-react';
import { useCourt, useCourtAvailability } from '@/hooks/use-courts';
import { useCreateBooking } from '@/hooks/use-bookings';
import tienMinh from '@/assets/tienminh.webp';
import type { ApiTimeSlot } from '@/types/court';
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

function SlotLabel({ slot }: { slot: ApiTimeSlot }) {
    return (
        <span className="font-semibold text-gray-700">
            {formatSlotTime(slot.startTime)} - {formatSlotTime(slot.endTime)}
        </span>
    );
}

const MOCK_REVIEWS = [
    {
        id: '1',
        name: 'Minh Quân',
        avatar: null,
        time: '2 ngày trước',
        rating: 5,
        comment: 'Sân rất đẹp, ánh sáng tốt, nhân viên nhiệt tình. Sẽ quay lại!',
    },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function CourtDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const { data: court, isLoading } = useCourt(id);
    const createBooking = useCreateBooking();

    const today = new Date();
    const [weekBase, setWeekBase] = useState(today);
    const [selectedDay, setSelectedDay] = useState(today);
    const [selectedSlot, setSelectedSlot] = useState<ApiTimeSlot | null>(null);
    const [selectedCourtNum, setSelectedCourtNum] = useState(1);
    const [bookingError, setBookingError] = useState<string | null>(null);
    const [bookingSuccess, setBookingSuccess] = useState(false);

    const dateStr = selectedDay.toISOString().split('T')[0];
    const { data: slots, isLoading: slotsLoading } = useCourtAvailability(id, dateStr);

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
        if (!selectedSlot) return;
        setBookingError(null);
        setBookingSuccess(false);
        try {
            await createBooking.mutateAsync({
                courtId: id,
                timeSlotId: selectedSlot.id,
                date: dateStr,
            });
            setBookingSuccess(true);
            setSelectedSlot(null);
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setBookingError(msg ?? 'Đặt sân thất bại. Vui lòng thử lại.');
        }
    }

    const courtCount = 5; // placeholder – extend ApiCourt if needed
    const amenities = [
        `${courtCount} sân`,
        ...(court?.hasLED ? ['Đèn LED'] : []),
        'Máy lạnh',
        'Cho thuê vợt',
    ];

    const SERVICE_FEE = 5000;
    const pricePerHour = court?.pricePerHour ?? 0;

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
                        {amenities.map((tag) => (
                            <span
                                key={tag}
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#E8F5F0] text-[#0F6E56] border border-[#0F6E56]/20"
                            >
                                {tag}
                            </span>
                        ))}
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
                                        key={i}
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
                            ) : !slots || slots.length === 0 ? (
                                <p className="col-span-3 text-center text-sm text-gray-400 py-6">
                                    Không có khung giờ trống trong ngày này.
                                </p>
                            ) : (
                                slots.map((slot) => {
                                    const isSelected = selectedSlot?.id === slot.id;
                                    return (
                                        <button
                                            key={slot.id}
                                            onClick={() => setSelectedSlot(isSelected ? null : slot)}
                                            className={[
                                                'flex flex-col items-start px-3 py-2 rounded-lg border text-xs transition-all',
                                                isSelected
                                                    ? 'border-[#0F6E56] bg-[#E8F5F0]'
                                                    : 'border-gray-200 hover:border-[#0F6E56]/50 bg-white',
                                            ].join(' ')}
                                        >
                                            <SlotLabel slot={slot} />
                                            <span className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                                                Còn trống
                                            </span>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Reviews */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h2 className="text-base font-semibold text-gray-800 mb-4">Đánh giá từ người chơi</h2>
                        <div className="flex flex-col gap-4">
                            {MOCK_REVIEWS.map((review) => (
                                <div key={review.id} className="flex gap-3">
                                    <div className="w-9 h-9 rounded-full bg-[#0F6E56] flex items-center justify-center text-white font-bold text-sm shrink-0">
                                        {review.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-gray-800">{review.name}</span>
                                            <span className="text-xs text-gray-400">{review.time}</span>
                                        </div>
                                        <div className="flex items-center gap-0.5 my-0.5">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-sm text-gray-600">{review.comment}</p>
                                    </div>
                                </div>
                            ))}
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

                        {/* Court number */}
                        <div className="mb-4">
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
                                Chọn sân
                            </p>
                            <select
                                value={selectedCourtNum}
                                onChange={(e) => setSelectedCourtNum(Number(e.target.value))}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0F6E56]/40"
                            >
                                {Array.from({ length: courtCount }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        Sân số {i + 1}
                                    </option>
                                ))}
                            </select>
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
                            ) : !slots || slots.length === 0 ? (
                                <p className="text-xs text-gray-400">Không có khung giờ trống.</p>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    {slots.slice(0, 6).map((slot) => {
                                        const isSelected = selectedSlot?.id === slot.id;
                                        return (
                                            <button
                                                key={slot.id}
                                                onClick={() => setSelectedSlot(isSelected ? null : slot)}
                                                className={[
                                                    'py-1.5 px-2 rounded-lg text-xs font-medium border transition-all',
                                                    isSelected
                                                        ? 'border-[#0F6E56] bg-[#0F6E56] text-white'
                                                        : 'border-gray-200 text-gray-600 hover:border-[#0F6E56]/60',
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
                            disabled={!selectedSlot || createBooking.isPending}
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
