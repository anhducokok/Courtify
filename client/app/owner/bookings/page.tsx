'use client';

import { useState } from 'react';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  ChevronDown,
} from 'lucide-react';

type ViewMode = 'day' | 'week' | 'month';

interface BookingBlock {
  id: string;
  courtId: string;
  startHour: number;
  endHour: number;
  customerName: string;
  phone: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

const COURTS = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'];

const INITIAL_BOOKINGS: BookingBlock[] = [
  { id: '1', courtId: 'A1', startHour: 7, endHour: 9, customerName: 'Nguyễn Văn A', phone: '0901...', status: 'confirmed' },
  { id: '2', courtId: 'A1', startHour: 14, endHour: 16, customerName: 'Trần Thị B', phone: '0912...', status: 'confirmed' },
  { id: '3', courtId: 'A2', startHour: 8, endHour: 10, customerName: 'Lê Văn C', phone: '0933...', status: 'confirmed' },
  { id: '4', courtId: 'A3', startHour: 10, endHour: 12, customerName: 'Phạm Thị D', phone: '0944...', status: 'pending' },
  { id: '5', courtId: 'A3', startHour: 17, endHour: 19, customerName: 'Hoàng Văn E', phone: '0955...', status: 'confirmed' },
  { id: '6', courtId: 'A4', startHour: 6, endHour: 8, customerName: 'Đặng Văn F', phone: '0966...', status: 'confirmed' },
  { id: '7', courtId: 'A4', startHour: 18, endHour: 20, customerName: 'Vũ Thị G', phone: '0977...', status: 'confirmed' },
  { id: '8', courtId: 'A5', startHour: 9, endHour: 11, customerName: 'Bùi Văn H', phone: '0988...', status: 'pending' },
  { id: '9', courtId: 'A5', startHour: 19, endHour: 21, customerName: 'Lý Thị K', phone: '0999...', status: 'confirmed' },
  { id: '10', courtId: 'A6', startHour: 7, endHour: 9, customerName: 'Trương Văn L', phone: '0900...', status: 'cancelled' },
  { id: '11', courtId: 'A6', startHour: 16, endHour: 18, customerName: 'Ngô Thị M', phone: '0911...', status: 'confirmed' },
  { id: '12', courtId: 'A2', startHour: 17, endHour: 19, customerName: 'Hà Văn N', phone: '0922...', status: 'pending' },
];

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6–22

const STATUS_COLOR: Record<BookingBlock['status'], string> = {
  confirmed: 'bg-[#1D9E75] text-white',
  pending: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-gray-100 text-gray-400 line-through',
};

const STATUS_LABEL: Record<BookingBlock['status'], string> = {
  confirmed: '',
  pending: 'Chờ xác nhận',
  cancelled: 'Đã hủy',
};

function formatHour(h: number) {
  return `${h.toString().padStart(2, '0')}:00`;
}

export default function OwnerBookingsPage() {
  const [view, setView] = useState<ViewMode>('week');
  const [courtFilter, setCourtFilter] = useState<string[]>([]);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingBlock | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1 + weekOffset * 7);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const fmtDay = (d: Date) =>
    d.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' });

  const toggleCourt = (c: string) => {
    setCourtFilter((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const activeCourts = courtFilter.length > 0 ? COURTS.filter((c) => courtFilter.includes(c)) : COURTS;

  const getBookingForCell = (dayIdx: number, courtId: string, hour: number) =>
    INITIAL_BOOKINGS.find(
      (b) =>
        b.courtId === courtId &&
        dayIdx === 0 && // simplified: show same day for demo
        hour >= b.startHour &&
        hour < b.endHour
    );

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold font-lexend text-[#085041]">Lịch đặt sân</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#0F6E56] hover:bg-[#085041] text-white text-sm font-semibold rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          Thêm đặt sân
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* View toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
          {(['day', 'week', 'month'] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                view === v
                  ? 'bg-white text-[#0F6E56] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {v === 'day' ? 'Ngày' : v === 'week' ? 'Tuần' : 'Tháng'}
            </button>
          ))}
        </div>

        {/* Week navigator */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setWeekOffset((w) => w - 1)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-gray-700 px-2">
            {fmtDay(weekDays[0])} – {fmtDay(weekDays[6])}
          </span>
          <button
            onClick={() => setWeekOffset((w) => w + 1)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Court filter */}
        <div className="relative">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {courtFilter.length === 0 ? 'Tất cả sân' : `${courtFilter.length} sân`}
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {showFilterDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 p-2 min-w-[160px]">
              {COURTS.map((c) => (
                <button
                  key={c}
                  onClick={() => toggleCourt(c)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    courtFilter.includes(c) ? 'bg-[#0F6E56]/10 text-[#0F6E56] font-semibold' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className={`w-4 h-4 rounded border flex items-center justify-center ${courtFilter.includes(c) ? 'bg-[#0F6E56] border-[#0F6E56]' : 'border-gray-300'}`}>
                    {courtFilter.includes(c) && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  Sân {c}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <div style={{ minWidth: '800px' }}>
            {/* Day headers */}
            <div className="flex border-b border-gray-100">
              <div className="w-14 flex-shrink-0" />
              {weekDays.map((day, di) => (
                <div key={di} className="flex-1 border-l border-gray-100">
                  <div className="py-2 text-center border-b border-gray-50">
                    <p className="text-xs text-gray-400">{day.toLocaleDateString('vi-VN', { weekday: 'short' })}</p>
                    <p className={`text-sm font-bold ${di === 4 ? 'text-[#0F6E56]' : 'text-gray-800'}`}>
                      {day.getDate()}
                    </p>
                  </div>
                  {/* Court sub-headers */}
                  <div className="flex">
                    {COURTS.map((c) => (
                      <div
                        key={c}
                        className="flex-1 py-1 text-center text-[10px] font-semibold text-gray-400 border-r border-gray-50 last:border-0"
                      >
                        {c}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Time rows */}
            {HOURS.map((hour) => (
              <div key={hour} className="flex border-b border-gray-50 last:border-0 min-h-[36px]">
                {/* Time label */}
                <div className="w-14 flex-shrink-0 flex items-center justify-end pr-2">
                  <span className="text-[10px] text-gray-300">{formatHour(hour)}</span>
                </div>

                {/* Day columns */}
                {weekDays.map((_, di) => (
                  <div key={di} className="flex-1 flex border-l border-gray-100 relative group">
                    {COURTS.map((c) => {
                      const booking = di === 0 ? getBookingForCell(di, c, hour) : undefined;
                      const isStart = booking && booking.startHour === hour;
                      const isMiddle = booking && booking.startHour < hour && hour < booking.endHour;

                      return (
                        <div
                          key={c}
                          className="flex-1 border-r border-gray-50 last:border-0 relative"
                        >
                          {isStart && booking && (
                            <button
                              onClick={() => setSelectedBooking(booking)}
                              className={`absolute inset-x-0.5 rounded-md px-1 py-0.5 text-left cursor-pointer hover:opacity-90 transition-opacity ${STATUS_COLOR[booking.status]}`}
                              style={{ top: '2px', height: `${(booking.endHour - booking.startHour) * 44 - 4}px` }}
                            >
                              <p className="text-[10px] font-semibold leading-tight truncate">{booking.customerName}</p>
                              <p className="text-[9px] opacity-70 leading-tight truncate">{booking.phone}</p>
                            </button>
                          )}
                          {isMiddle && null}
                          {!booking && (
                            <div className="absolute inset-0.5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                              <span className="w-5 h-5 rounded bg-[#0F6E56]/10 text-[#0F6E56] flex items-center justify-center text-xs font-bold">+</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 flex-wrap">
        <span className="text-xs text-gray-400 font-medium">Trạng thái:</span>
        {[
          { color: '#1D9E75', label: 'Đã xác nhận' },
          { color: '#F59E0B', label: 'Chờ xác nhận' },
          { color: '#9CA3AF', label: 'Đã hủy' },
          { color: '#F3F4F6', border: '#D1D5DB', label: 'Trống' },
        ].map((item) => (
          <span key={item.label} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{
                background: item.color ?? 'transparent',
                border: item.border ? `1px solid ${item.border}` : undefined,
              }}
            />
            {item.label}
          </span>
        ))}
      </div>

      {/* Booking Popover */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20" onClick={() => setSelectedBooking(null)} />
          <div className="relative bg-white rounded-2xl w-full max-w-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold font-lexend text-gray-900">Chi tiết đặt sân</h3>
              <button onClick={() => setSelectedBooking(null)} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Khách hàng</p>
                <p className="font-semibold text-gray-900">{selectedBooking.customerName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Sân</p>
                <p className="font-semibold text-[#0F6E56]">{selectedBooking.courtId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Giờ</p>
                <p className="font-semibold text-gray-700">
                  {formatHour(selectedBooking.startHour)} – {formatHour(selectedBooking.endHour)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Trạng thái</p>
                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${STATUS_COLOR[selectedBooking.status]}`}>
                  {STATUS_LABEL[selectedBooking.status] || 'Đã xác nhận'}
                </span>
              </div>
            </div>
            <div className="flex gap-2 px-5 py-4 border-t border-gray-100">
              <button className="flex-1 px-3 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50">
                Hủy
              </button>
              <button className="flex-1 px-3 py-2 bg-[#0F6E56] text-white rounded-lg text-xs font-semibold hover:bg-[#085041]">
                Xem chi tiết
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
