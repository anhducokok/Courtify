'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBooking } from '@/components/booking/booking-context';
import { useSepayRedirect } from '@/hooks/use-sepay';
import { CheckCircle2, Calendar, Clock, MapPin, Loader2 } from 'lucide-react';

export default function BookingSuccessPage() {
  const { state, resetBooking } = useBooking();
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  // Handle redirect params from SePay
  const { redirectStatus, orderId, clearStatus } = useSepayRedirect();
  const [isVerifying, setIsVerifying] = useState(false);

  // Redirect home if no booking data (except when coming from SePay redirect)
  useEffect(() => {
    if (!state.bookingId && !orderId) {
      router.replace('/');
    }
  }, [state.bookingId, orderId, router]);

  // Show success when redirect is successful or booking already confirmed
  useEffect(() => {
    if (redirectStatus === 'success' && orderId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsVerifying(true);
      // Wait a moment for the server to process the payment
      const timer = setTimeout(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsVerifying(false);
        clearStatus();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [redirectStatus, orderId, clearStatus]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) {
      resetBooking();
      router.push('/');
      return;
    }
    const t = setTimeout(() => setCountdown((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, router, resetBooking]);

  // Don't show page if still verifying
  if (isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <Loader2 className="w-12 h-12 text-[#0F6E56] animate-spin mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Đang xác nhận thanh toán...</h2>
        <p className="text-gray-500">Vui lòng chờ trong giây lát</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      {/* Success icon */}
      <div className="w-20 h-20 rounded-full bg-[#D4FF00]/30 flex items-center justify-center mb-6 animate-bounce">
        <CheckCircle2 className="w-12 h-12 text-[#0F6E56]" />
      </div>

      <h1 className="text-2xl font-bold font-lexend text-gray-900 mb-2">
        Đặt sân thành công!
      </h1>
      <p className="text-gray-500 mb-8 max-w-sm">
        Cảm ơn bạn đã đặt sân. Thông tin xác nhận đã được gửi đến chủ sân.
      </p>

      {/* Booking details card */}
      {state.bookingId && (
        <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 p-5 space-y-3 text-left mb-8">
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-[#0F6E56] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-900">{state.court.venueName}</p>
              <p className="text-xs text-[#0F6E56] font-medium">{state.court.courtName}</p>
              <p className="text-xs text-gray-400 mt-0.5">{state.court.address}</p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3 space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-700">{state.court.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-700">{state.court.time}</span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
            <span className="text-sm text-gray-500">Tổng cộng</span>
            <span className="font-bold font-lexend text-[#0F6E56] text-lg">
              {new Intl.NumberFormat('vi-VN').format(state.pricing.total)}đ
            </span>
          </div>
        </div>
      )}

      <button
        onClick={() => {
          resetBooking();
          router.push('/');
        }}
        className="px-8 py-3 bg-[#0F6E56] hover:bg-[#0a5a45] text-white font-semibold rounded-xl transition-colors text-sm"
      >
        Quay về trang chủ ({countdown}s)
      </button>
    </div>
  );
}
