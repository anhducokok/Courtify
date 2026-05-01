'use client';

import { MapPin, Calendar, Clock, User, Phone } from 'lucide-react';

interface CourtInfo {
  venueName: string;
  courtName: string;
  address: string;
  date: string;
  time: string;
  duration: string;
}

interface BookingSummaryCardProps {
  court: CourtInfo;
  contactName?: string;
  contactPhone?: string;
  showSubtotal?: boolean;
  subtotal?: number;
  serviceFee?: number;
  discount?: number;
  total?: number;
  compact?: boolean;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN').format(n) + 'đ';

export function BookingSummaryCard({
  court,
  contactName,
  contactPhone,
  showSubtotal = false,
  subtotal = 0,
  serviceFee = 0,
  discount = 0,
  total = 0,
  compact = false,
}: BookingSummaryCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Court info */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0F6E56]/10 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-[#0F6E56]" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm leading-tight">
              {court.venueName}
            </p>
            <p className="text-[#0F6E56] font-semibold text-xs mt-0.5">{court.courtName}</p>
            <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {court.address}
            </p>
          </div>
        </div>
      </div>

      {/* Booking details */}
      <div className={`p-4 ${compact ? 'space-y-2' : 'space-y-3'}`}>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="text-sm text-gray-700">{court.date}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="text-sm text-gray-700">
            {court.time}
            {court.duration && (
              <span className="text-gray-400 ml-1">· {court.duration}</span>
            )}
          </span>
        </div>
        {contactName && (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-sm text-gray-700">{contactName}</span>
          </div>
        )}
        {contactPhone && (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-sm text-gray-700">{contactPhone}</span>
          </div>
        )}
      </div>

      {/* Price breakdown */}
      {showSubtotal && (
        <div className="px-4 pb-4 space-y-2">
          <div className="border-t border-gray-100 pt-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Tiền sân</span>
              <span className="text-sm font-medium text-gray-700">{fmt(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Phí dịch vụ</span>
              <span className="text-sm font-medium text-gray-700">{fmt(serviceFee)}</span>
            </div>
            {discount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Giảm giá</span>
                <span className="text-sm font-semibold text-[#0F6E56]">-{fmt(discount)}</span>
              </div>
            )}
          </div>
          {total > 0 && (
            <div className="border-t border-gray-100 pt-2 flex items-center justify-between">
              <span className="font-semibold text-gray-900 text-sm">Tổng cộng</span>
              <span className="font-bold font-lexend text-[#0F6E56] text-lg">{fmt(total)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
