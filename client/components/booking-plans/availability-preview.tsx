'use client';

import { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import {
  useAvailability,
  bookingPlanKeys,
} from '@/hooks/use-booking-plans';
import {
  DAY_LABELS,
  minutesToTimeStr,
  formatVND,
  type ResolvedSlot,
} from '@/types/booking-plan';
import { useQueryClient } from '@tanstack/react-query';

interface AvailabilityPreviewProps {
  fieldId: string;
  fieldName: string;
  fieldPricePerHour: number;
}

const SLOT_MINUTES = 30;

function getDayLabel(date: Date): string {
  const dow = date.getDay();
  return DAY_LABELS.find((d) => d.value === dow)?.full ?? '';
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function AvailabilityPreview({
  fieldId,
  fieldName,
  fieldPricePerHour,
}: AvailabilityPreviewProps) {
  const qc = useQueryClient();
  const today = new Date();

  const [date, setDate] = useState<string>(
    today.toISOString().slice(0, 10),
  );

  const queryDate = date || undefined;
  const { data: slots, isLoading, isError } = useAvailability(fieldId, queryDate);

  const selectedDate = queryDate ? new Date(queryDate + 'T00:00:00') : today;

  const prevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setDate(d.toISOString().slice(0, 10));
  };

  const nextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setDate(d.toISOString().slice(0, 10));
  };

  const refresh = () => {
    qc.invalidateQueries({
      queryKey: bookingPlanKeys.availability(fieldId, queryDate ?? ''),
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#0F6E56]" />
          <h3 className="font-semibold text-gray-800 text-sm">
            Xem trước kết quả giá
          </h3>
        </div>
        <button
          onClick={refresh}
          className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
          title="Làm mới"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Date selector */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <button
          onClick={prevDay}
          className="px-3 py-1.5 rounded-lg hover:bg-gray-100 text-gray-600 text-sm font-medium transition-colors"
        >
          ← Trước
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-800">
            {formatDate(selectedDate)}
          </p>
          <p className="text-xs text-gray-400">{getDayLabel(selectedDate)}</p>
        </div>
        <button
          onClick={nextDay}
          className="px-3 py-1.5 rounded-lg hover:bg-gray-100 text-gray-600 text-sm font-medium transition-colors"
        >
          Sau →
        </button>
      </div>

      {/* Slot list */}
      <div className="max-h-[320px] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-[#0F6E56]" />
          </div>
        ) : isError || !slots ? (
          <div className="flex flex-col items-center gap-2 py-10 px-4 text-center">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
            <p className="text-sm text-gray-600">
              Không thể tải dữ liệu availability.
            </p>
          </div>
        ) : slots.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 px-4 text-center">
            <XCircle className="w-8 h-8 text-gray-300" />
            <p className="text-sm text-gray-500">
              Không có khung giờ nào được thiết lập cho ngày này.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {slots.map((slot) => (
              <SlotRow
                key={slot.time}
                slot={slot}
                fieldPricePerHour={fieldPricePerHour}
                isFirst={slot === slots[0]}
              />
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {slots && slots.length > 0 && (
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs text-gray-500">
          <span>
            Giá mặc định:{' '}
            <strong className="text-gray-700">{formatVND(fieldPricePerHour)}/giờ</strong>
          </span>
          <span>
            {slots.filter((s) => s.available).length} khung giờ hoạt động
          </span>
        </div>
      )}
    </div>
  );
}

function SlotRow({
  slot,
  fieldPricePerHour,
  isFirst,
}: {
  slot: ResolvedSlot;
  fieldPricePerHour: number;
  isFirst: boolean;
}) {
  const priceChanged = slot.price !== fieldPricePerHour;
  return (
    <div className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50/60 transition-colors">
      {/* Status icon */}
      <div className="shrink-0">
        {slot.available ? (
          <CheckCircle2 className="w-4 h-4 text-green-500" />
        ) : (
          <XCircle className="w-4 h-4 text-gray-300" />
        )}
      </div>

      {/* Time range */}
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-800">
          {minutesToTimeStr(slot.time)} – {minutesToTimeStr(slot.time + 30)}
        </p>
        {slot.blockedReason && (
          <p className="text-xs text-gray-400">{slot.blockedReason}</p>
        )}
      </div>

      {/* Price */}
      {slot.available ? (
        <div className="text-right">
          <p
            className={`text-sm font-semibold ${
              priceChanged ? 'text-[#0F6E56]' : 'text-gray-700'
            }`}
          >
            {formatVND(slot.price)}
          </p>
          {priceChanged && (
            <p className="text-[10px] text-gray-400">
              {slot.price > fieldPricePerHour ? '↑ peak' : '↓ off-peak'}
            </p>
          )}
        </div>
      ) : (
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          Đóng
        </span>
      )}
    </div>
  );
}
