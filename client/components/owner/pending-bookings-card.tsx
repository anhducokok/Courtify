'use client';

import { Check, X, Clock } from 'lucide-react';

export interface PendingBooking {
  id: string;
  customerName: string;
  phone: string;
  date: string;
  time: string;
  court: string;
  price: string;
}

interface PendingBookingsCardProps {
  bookings: PendingBooking[];
  onConfirm?: (id: string) => void;
  onReject?: (id: string) => void;
}

export function PendingBookingsCard({
  bookings,
  onConfirm,
  onReject,
}: PendingBookingsCardProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
          <Clock className="w-3 h-3" />
          Cần xử lý
        </span>
        <span className="text-xs text-gray-400">{bookings.length} lượt chờ</span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto">
        {bookings.map((b) => (
          <div
            key={b.id}
            className="bg-gray-50 rounded-xl p-4 border border-gray-100"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{b.customerName}</p>
                <p className="text-xs text-gray-500 mt-0.5">{b.phone}</p>
              </div>
              <span className="flex-shrink-0 text-xs font-semibold text-[#0F6E56] bg-[#0F6E56]/10 px-2 py-0.5 rounded-full">
                {b.court}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
              <span>{b.date}</span>
              <span>{b.time}</span>
              <span className="ml-auto font-semibold text-gray-700">{b.price}</span>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => onConfirm?.(b.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#0F6E56] hover:bg-[#085041] text-white text-xs font-semibold rounded-lg transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Xác nhận
              </button>
              <button
                onClick={() => onReject?.(b.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-red-300 text-red-500 hover:bg-red-50 text-xs font-semibold rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Từ chối
              </button>
            </div>
          </div>
        ))}

        {bookings.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            Không có lượt chờ nào
          </div>
        )}
      </div>
    </div>
  );
}
