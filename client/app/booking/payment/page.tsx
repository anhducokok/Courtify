'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBooking } from '@/components/booking/booking-context';
import { useConfirmBooking } from '@/hooks/use-bookings';
import { BookingSummaryCard } from '@/components/booking/booking-summary-card';
import {
  Loader2,
  CheckCircle2,
  Info,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
} from 'lucide-react';

type PaymentMethod = 'momo' | 'vnpay' | 'cash';

interface PromoState {
  code: string;
  discount: number;
  applied: boolean;
  error: string;
}

const PAYMENT_OPTIONS: Array<{
  id: PaymentMethod;
  label: string;
  description: string;
}> = [
  { id: 'momo', label: 'Ví MoMo', description: 'Thanh toán qua ví MoMo' },
  { id: 'vnpay', label: 'VNPay QR', description: 'Quét mã QR ngân hàng' },
  { id: 'cash', label: 'Thanh toán tại sân', description: 'Thanh toán khi đến sân' },
];

const CANCELLATION_NOTE =
  'Miễn phí hủy trước 2 tiếng. Sau đó mất 50% phí.';

function PaymentIcon({ method }: { method: PaymentMethod }) {
  if (method === 'momo') {
    return (
      <div className="w-9 h-9 rounded-lg bg-pink-50 flex items-center justify-center flex-shrink-0">
        <svg viewBox="0 0 36 36" className="w-6 h-6">
          <circle cx="18" cy="18" r="18" fill="#A50064" />
          <text x="18" y="24" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
            M
          </text>
        </svg>
      </div>
    );
  }
  if (method === 'vnpay') {
    return (
      <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
        <svg viewBox="0 0 36 36" className="w-6 h-6">
          <circle cx="18" cy="18" r="18" fill="#0066B3" />
          <text x="18" y="24" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">
            VnPay
          </text>
        </svg>
      </div>
    );
  }
  return (
    <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
      <svg viewBox="0 0 24 24" className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <circle cx="9" cy="12" r="1.5" fill="currentColor" />
        <path d="M15 10h1.5M15 14h1.5M13 12h3" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export default function BookingPaymentPage() {
  const { state, updatePayment } = useBooking();
  const confirmBooking = useConfirmBooking();
  const router = useRouter();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(
    (state.payment.method as PaymentMethod) ?? 'momo',
  );
  const [promo, setPromo] = useState<PromoState>({
    code: state.payment.promoCode,
    discount: state.payment.promoDiscount,
    applied: !!state.payment.promoCode,
    error: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Guard: redirect if no active booking
  useEffect(() => {
    if (!state.bookingId) {
      router.replace('/');
    }
  }, [state.bookingId, router]);

  const effectiveDiscount = promo.applied ? promo.discount : 0;
  const total = Math.max(0, state.pricing.subtotal + state.pricing.serviceFee - effectiveDiscount);

  const handleApplyPromo = () => {
    if (!promo.code.trim()) {
      setPromo((p) => ({ ...p, error: 'Vui lòng nhập mã giảm giá.' }));
      return;
    }
    if (promo.code.toUpperCase() === 'SMASH20') {
      setPromo({ code: promo.code.toUpperCase(), discount: 20_000, applied: true, error: '' });
    } else {
      setPromo((p) => ({ ...p, discount: 0, applied: false, error: 'Mã giảm giá không hợp lệ.' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.bookingId) return;
    setSubmitting(true);
    updatePayment({
      method: selectedMethod,
      promoCode: promo.code,
      promoDiscount: effectiveDiscount,
    });
    try {
      await confirmBooking.mutateAsync(state.bookingId);
      router.push('/booking/success');
    } catch {
      // Handle error — stay on page
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col lg:flex-row gap-6">

        {/* ── LEFT: Phương thức thanh toán ─────────────────────── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Section title */}
          <div>
            <h2 className="text-xl font-bold font-lexend text-gray-900">
              Phương thức thanh toán
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Chọn hình thức thanh toán phù hợp với bạn.
            </p>
          </div>

          {/* Payment method cards */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {PAYMENT_OPTIONS.map((opt, idx) => {
              const isSelected = selectedMethod === opt.id;
              return (
                <div key={opt.id}>
                  <label
                    className={[
                      'flex items-center gap-4 px-5 py-4 cursor-pointer transition-all',
                      isSelected
                        ? 'bg-[#D4FF00]/10 border-l-2 border-[#0F6E56]'
                        : 'border-l-2 border-transparent hover:bg-gray-50',
                    ].join(' ')}
                  >
                    {/* Radio */}
                    <div
                      className={[
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                        isSelected
                          ? 'border-[#0F6E56] bg-[#0F6E56]'
                          : 'border-gray-300 bg-white',
                      ].join(' ')}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <input
                      type="radio"
                      name="payment-method"
                      value={opt.id}
                      checked={isSelected}
                      onChange={() => setSelectedMethod(opt.id)}
                      className="sr-only"
                    />

                    <PaymentIcon method={opt.id} />

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{opt.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{opt.description}</p>
                    </div>

                    {/* Selected check */}
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-[#0F6E56] flex-shrink-0" />
                    )}
                  </label>

                  {idx < PAYMENT_OPTIONS.length - 1 && (
                    <div className="mx-5 border-t border-gray-100" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Promo code */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-sm font-semibold text-gray-800 mb-3">Mã giảm giá</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={promo.code}
                  onChange={(e) =>
                    setPromo((p) => ({
                      ...p,
                      code: e.target.value,
                      applied: false,
                      error: '',
                    }))
                  }
                  placeholder="VD: SMASH20"
                  className={[
                    'w-full px-4 py-2.5 rounded-xl border text-sm font-medium tracking-wider uppercase',
                    'placeholder:normal-case placeholder:text-gray-400 placeholder:tracking-normal',
                    'focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent',
                    promo.error ? 'border-red-400 bg-red-50/30' : 'border-gray-200 bg-white',
                  ].join(' ')}
                  style={{ height: 40 }}
                />
              </div>
              {promo.applied ? (
                <div className="flex items-center gap-2 px-4 bg-[#D4FF00]/30 border border-[#0F6E56]/30 rounded-xl text-sm font-semibold text-[#0F6E56]">
                  <CheckCircle2 className="w-4 h-4" />
                  Giảm {new Intl.NumberFormat('vi-VN').format(promo.discount)}đ
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="px-5 py-2.5 border border-[#0F6E56] text-[#0F6E56] rounded-xl text-sm font-semibold hover:bg-[#0F6E56]/5 transition-colors flex items-center"
                  style={{ height: 40 }}
                >
                  Áp dụng
                </button>
              )}
            </div>

            {promo.error && (
              <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                <Info className="w-3 h-3" />
                {promo.error}
              </p>
            )}
          </div>

          {/* Cancellation reminder */}
          <div className="flex items-start gap-3 p-4 bg-[#D4FF00]/20 border border-[#0F6E56]/20 rounded-2xl">
            <Info className="w-4 h-4 text-[#0F6E56] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700 leading-relaxed">
              {CANCELLATION_NOTE}
            </p>
          </div>
        </div>

        {/* ── RIGHT: Final Summary ──────────────────────────────── */}
        <div className="w-full lg:w-96 lg:shrink-0">
          <div className="lg:sticky lg:top-6 space-y-3">

            {/* Full booking summary card */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">

              {/* Court info */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0F6E56]/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-[#0F6E56]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm leading-tight">
                      {state.court.venueName}
                    </p>
                    <p className="text-[#0F6E56] font-semibold text-xs mt-0.5">
                      {state.court.courtName}
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      {state.court.address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Booking details */}
              <div className="p-4 space-y-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{state.court.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    {state.court.time}
                    {state.court.duration && (
                      <span className="text-gray-400 ml-1">· {state.court.duration}</span>
                    )}
                  </span>
                </div>
                {state.contact.name && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{state.contact.name}</span>
                  </div>
                )}
                {state.contact.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{state.contact.phone}</span>
                  </div>
                )}
              </div>

              {/* Price breakdown */}
              <div className="p-4 space-y-2">
                <div className="border-t border-gray-100 pt-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Tiền sân</span>
                    <span className="text-sm font-medium text-gray-700">
                      {new Intl.NumberFormat('vi-VN').format(state.pricing.subtotal)}đ
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Phí dịch vụ</span>
                    <span className="text-sm font-medium text-gray-700">
                      {new Intl.NumberFormat('vi-VN').format(state.pricing.serviceFee)}đ
                    </span>
                  </div>
                  {effectiveDiscount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Giảm giá</span>
                      <span className="text-sm font-semibold text-[#0F6E56]">
                        -{new Intl.NumberFormat('vi-VN').format(effectiveDiscount)}đ
                      </span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                  <span className="font-semibold text-gray-900 text-sm">Tổng cộng</span>
                  <span className="font-bold font-lexend text-[#0F6E56] text-xl">
                    {new Intl.NumberFormat('vi-VN').format(total)}đ
                  </span>
                </div>

                {/* Payment method badge */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-gray-400">Thanh toán qua:</span>
                  <span className="text-xs font-semibold text-gray-600">
                    {PAYMENT_OPTIONS.find((o) => o.id === selectedMethod)?.label}
                  </span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-[#0F6E56] hover:bg-[#0a5a45] disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-colors"
              style={{ height: 48 }}
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Xác nhận đặt sân'
              )}
            </button>

            {/* Back link */}
            <button
              type="button"
              onClick={() => router.push('/booking/info')}
              className="w-full flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-[#0F6E56] font-medium transition-colors py-1"
            >
              <svg viewBox="0 0 16 16" className="w-4 h-4 flex-shrink-0">
                <path
                  d="M13 8H3M7 4L3 8l4 4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
              Quay lại bước 2
            </button>

            {/* Terms note */}
            <p className="text-center text-xs text-gray-400 leading-relaxed">
              Bằng cách đặt sân, bạn đồng ý với{' '}
              <span className="text-[#0F6E56] underline cursor-pointer">Điều khoản sử dụng</span>.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
