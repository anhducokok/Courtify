'use client';

import { FieldSelector } from '@/components/booking-plans/field-selector';

export default function BookingPlansPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 font-lexend">
          Lịch sân &amp; Giá đặc biệt
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Thiết lập khung giờ hoạt động, giá theo thời điểm và lịch ngoại lệ
          cho từng sân của bạn.
        </p>
      </div>

      <FieldSelector />
    </div>
  );
}
