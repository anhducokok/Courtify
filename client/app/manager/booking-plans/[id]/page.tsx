'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, AlertCircle, MapPin } from 'lucide-react';
import { useBookingPlans } from '@/hooks/use-booking-plans';
import { WeeklyCalendarGrid } from '@/components/booking-plans/weekly-calendar-grid';
import { AvailabilityPreview } from '@/components/booking-plans/availability-preview';
import { ExceptionsManager } from '@/components/booking-plans/exceptions-manager';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function BookingPlansDetailPage({ params }: PageProps) {
  const resolved = use(params);
  const fieldId = resolved.id;
  const router = useRouter();

  const { data, isLoading, isError, error, refetch } = useBookingPlans(fieldId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-10 h-10 animate-spin text-[#0F6E56]" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-gray-600 font-medium">
          Không thể tải dữ liệu booking plans.
        </p>
        <p className="text-sm text-gray-400">{String(error)}</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-[#0F6E56] text-white rounded-lg text-sm font-medium hover:bg-[#1F4D2B] transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const { weekly, exceptions } = data;

  // Infer field name from the first plan, or use a fallback
  const fieldName = 'Sân của bạn';
  const fieldPricePerHour = 200000; // TODO: fetch from field detail API

  return (
    <div className="space-y-6">
      {/* Back + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/manager/booking-plans')}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 font-lexend">
            Lịch sân &amp; Giá đặc biệt
          </h1>
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5" />
            {fieldName}
          </p>
        </div>
      </div>

      {/* Weekly grid */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-800 text-sm">
              Lịch hàng tuần
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {weekly.length} rule đang áp dụng
            </p>
          </div>
        </div>

        <div className="p-4 overflow-x-auto">
          <WeeklyCalendarGrid
            fieldId={fieldId}
            fieldName={fieldName}
            fieldPricePerHour={fieldPricePerHour}
            plans={weekly}
            onPlanCreated={refetch}
            onPlanUpdated={refetch}
            onPlanDeleted={refetch}
          />
        </div>
      </div>

      {/* Exceptions */}
      <ExceptionsManager
        fieldId={fieldId}
        fieldName={fieldName}
        fieldPricePerHour={fieldPricePerHour}
        exceptions={exceptions}
        onDeleted={refetch}
        onCreated={refetch}
      />

      {/* Availability preview */}
      <AvailabilityPreview
        fieldId={fieldId}
        fieldName={fieldName}
        fieldPricePerHour={fieldPricePerHour}
      />
    </div>
  );
}
