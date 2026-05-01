import React from 'react';
import { MapPin, Calendar, Clock, Banknote, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ApiBooking, BookingStatus } from '@/types/booking';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface BookingCardProps {
  booking: ApiBooking;
  onCancel?: (id: string) => void;
  isCanceling?: boolean;
}

const statusConfig: Record<BookingStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  PENDING: { label: 'Chờ xác nhận', variant: 'secondary' },
  CONFIRMED: { label: 'Đã xác nhận', variant: 'default' },
  CANCELLED: { label: 'Đã huỷ', variant: 'destructive' },
};

export function BookingCard({ booking, onCancel, isCanceling }: BookingCardProps) {
  const { field, timeSlot, status, date } = booking;
  const config = statusConfig[status];

  // Format date: e.g., 28/04/2026
  let formattedDate = date;
  try {
    formattedDate = format(new Date(date), 'dd/MM/yyyy', { locale: vi });
  } catch (e) {
    // fallback to raw string if parsing fails
  }

  // Format price
  const price = field?.pricePerHour ? new Intl.NumberFormat('vi-VN').format(field.pricePerHour) : '0';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col sm:flex-row gap-5 hover:shadow-md transition-shadow">
      {/* Icon/Avatar Placeholder for Field */}
      <div className="hidden sm:flex shrink-0 w-20 h-20 bg-emerald-50 rounded-lg items-center justify-center text-emerald-600">
        <MapPin className="w-8 h-8 opacity-50" />
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2 gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 truncate">{field?.name || 'Sân không xác định'}</h3>
            <p className="text-sm text-gray-500 truncate mt-0.5">{field?.court?.name || 'Cơ sở không xác định'}</p>
          </div>
          <Badge variant={config.variant} className="shrink-0">{config.label}</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-600 mt-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 shrink-0 text-gray-400" />
            <span className="truncate">{field?.court?.location || 'Không có địa chỉ'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 shrink-0 text-gray-400" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 shrink-0 text-gray-400" />
            <span>{timeSlot ? `${timeSlot.startTime.slice(0, 5)} - ${timeSlot.endTime.slice(0, 5)}` : 'Chưa có khung giờ'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Banknote className="w-4 h-4 shrink-0 text-gray-400" />
            <span className="font-medium text-emerald-600">{price} ₫/giờ</span>
          </div>
        </div>
      </div>

      {status !== 'CANCELLED' && onCancel && (
        <div className="flex items-end justify-end sm:flex-col sm:justify-start pt-4 sm:pt-0 border-t sm:border-t-0 sm:border-l border-gray-100 sm:pl-5 mt-4 sm:mt-0">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            onClick={() => onCancel(booking.id)}
            disabled={isCanceling}
          >
            <XCircle className="w-4 h-4 mr-2" />
            {isCanceling ? 'Đang huỷ...' : 'Huỷ lịch'}
          </Button>
        </div>
      )}
    </div>
  );
}
