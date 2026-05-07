'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useBooking } from '@/components/booking/booking-context';
import { useSepayCheckout, useSepayRedirect } from '@/hooks/use-sepay';
import { useConfirmBooking } from '@/hooks/use-bookings';
import {
  Loader2,
  CheckCircle2,
  Info,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  QrCode,
  Copy,
  ExternalLink,
  AlertCircle,
  X,
} from 'lucide-react';

type PaymentMethod = 'sepay' | 'cash';
type CheckoutStep = 'select' | 'qr' | 'processing' | 'success';

const PAYMENT_OPTIONS: Array<{
  id: PaymentMethod;
  label: string;
  description: string;
}> = [
  { id: 'sepay', label: 'Chuyển khoản QR', description: 'Quét mã QR để thanh toán qua SePay' },
  { id: 'cash', label: 'Thanh toán tại sân', description: 'Thanh toán khi đến sân' },
];

const CANCELLATION_NOTE =
  'Miễn phí hủy trước 2 tiếng. Sau đó mất 50% phí.';

function SepayPaymentForm({
  initUrl,
  formFields,
  amount,
  onCancel,
}: {
  initUrl: string;
  formFields: Record<string, unknown>;
  amount: number;
  onCancel: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Auto-submit the form after a brief delay to open SePay gateway
    const timer = setTimeout(() => {
      formRef.current?.submit();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleCopyAccount = () => {
    const accountNo = formFields.account_no as string;
    if (accountNo) {
      navigator.clipboard.writeText(accountNo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0F6E56]/10 flex items-center justify-center">
            <QrCode className="w-5 h-5 text-[#0F6E56]" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Thanh toán qua SePay</h3>
            <p className="text-sm text-gray-500">Quét mã QR để chuyển khoản</p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* QR Code placeholder - SePay will provide this */}
      <div className="flex justify-center py-4">
        <div className="w-64 h-64 bg-gray-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-200">
          <div className="text-center">
            <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Đang tải mã QR...</p>
          </div>
        </div>
      </div>

      {/* Payment info */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Số tài khoản</span>
          <div className="flex items-center gap-2">
            <span className="font-mono font-semibold text-gray-900">
              {(formFields.account_no as string) || 'Đang tải...'}
            </span>
            {formFields.account_no && (
              <button
                onClick={handleCopyAccount}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                {copied ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Ngân hàng</span>
          <span className="font-semibold text-gray-900">
            {(formFields.bank_name as string) || 'Đang tải...'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Tên tài khoản</span>
          <span className="font-semibold text-gray-900">
            {(formFields.account_name as string) || 'Đang tải...'}
          </span>
        </div>
        <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-700">Số tiền</span>
          <span className="font-bold text-xl text-[#0F6E56]">
            {new Intl.NumberFormat('vi-VN').format(amount)}đ
          </span>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-[#D4FF00]/20 rounded-xl p-4 space-y-2">
        <p className="text-sm font-semibold text-gray-800">Hướng dẫn thanh toán:</p>
        <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
          <li>Mở ứng dụng ngân hàng hoặc ví điện tử</li>
          <li>Quét mã QR hoặc chuyển khoản theo thông tin trên</li>
          <li>Nội dung chuyển khoản: <span className="font-mono font-semibold">{(formFields.content as string) || '...'}</span></li>
          <li>Sau khi chuyển thành công, hệ thống sẽ tự động xác nhận</li>
        </ol>
      </div>

      {/* Hidden form for SePay gateway redirect */}
      <form
        ref={formRef}
        action={initUrl}
        method="POST"
        target="_blank"
        style={{ display: 'none' }}
      >
        {Object.entries(formFields).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={String(value)} />
        ))}
      </form>

      {/* Manual open gateway button */}
      <a
        href={initUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3 bg-[#0F6E56] hover:bg-[#0a5a45] text-white font-semibold rounded-xl transition-colors"
      >
        <ExternalLink className="w-4 h-4" />
        Mở cổng thanh toán SePay
      </a>

      <p className="text-xs text-gray-400 text-center">
        Bạn sẽ được chuyển đến cổng thanh toán SePay an toàn
      </p>
    </div>
  );
}

export default function BookingPaymentPage() {
  const { state, resetBooking } = useBooking();
  const confirmBooking = useConfirmBooking();
  const { checkoutData, isLoading, error, initiateCheckout, clearCheckout } = useSepayCheckout();
  const { redirectStatus, orderId, clearStatus } = useSepayRedirect();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(
    (state.payment.method as PaymentMethod) ?? 'sepay',
  );
  const [promo] = useState({
    code: state.payment.promoCode,
    discount: state.payment.promoDiscount,
    applied: !!state.payment.promoCode,
    error: '',
  });
  const [step, setStep] = useState<CheckoutStep>('select');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const effectiveDiscount = promo.applied ? promo.discount : 0;
  const total = Math.max(0, state.pricing.subtotal + state.pricing.serviceFee - effectiveDiscount);

  const handleSelectMethod = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setErrorMessage('');
  };

  const handlePaymentSuccess = useCallback(async () => {
    try {
      if (state.bookingId) {
        await confirmBooking.mutateAsync(state.bookingId);
      }
      setStep('success');
      setTimeout(() => {
        resetBooking();
        router.push('/booking/success');
      }, 1500);
    } catch {
      setErrorMessage('Không thể xác nhận đặt sân. Vui lòng liên hệ hỗ trợ.');
      setStep('select');
    }
  }, [state.bookingId, confirmBooking, resetBooking, router]);

  const handleCashPayment = async () => {
    try {
      if (state.bookingId) {
        await confirmBooking.mutateAsync(state.bookingId);
      }
      resetBooking();
      router.push('/booking/success');
    } catch {
      setErrorMessage('Không thể xác nhận đặt sân. Vui lòng thử lại.');
    }
  };

  const handleCancelQR = () => {
    clearCheckout();
    setStep('select');
  };

  // Guard: redirect if no active booking
  useEffect(() => {
    if (!state.bookingId && step === 'select') {
      router.replace('/');
    }
  }, [state.bookingId, router, step]);

  // Handle SePay redirect status
  useEffect(() => {
    if (redirectStatus === 'success' && orderId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStep('processing');
      handlePaymentSuccess();
    } else if (redirectStatus === 'error') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setErrorMessage('Thanh toán thất bại. Vui lòng thử lại.');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStep('select');
      clearStatus();
    } else if (redirectStatus === 'cancel') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStep('select');
      clearStatus();
    }
  }, [redirectStatus, orderId, handlePaymentSuccess, clearStatus]);

  // Show error from checkout init
  useEffect(() => {
    if (error) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setErrorMessage('Không thể khởi tạo thanh toán. Vui lòng thử lại.');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStep('select');
    }
  }, [error]);

  const handleConfirmPayment = async () => {
    setErrorMessage('');

    if (selectedMethod === 'sepay') {
      setStep('qr');
      initiateCheckout(total);
    } else {
      await handleCashPayment();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* ── LEFT: Phương thức thanh toán ─────────────────────── */}
      <div className="flex-1 min-w-0 space-y-4">

        {/* Section title */}
        <div>
          <h2 className="text-xl font-bold font-lexend text-gray-900">
            {step === 'success'
              ? 'Thanh toán thành công'
              : step === 'processing'
                ? 'Đang xử lý...'
                : 'Phương thức thanh toán'}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {step === 'success'
              ? 'Cảm ơn bạn đã thanh toán!'
              : step === 'processing'
                ? 'Vui lòng chờ trong giây lát...'
                : 'Chọn hình thức thanh toán phù hợp với bạn.'}
          </p>
        </div>

        {/* Processing state */}
        {step === 'processing' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <Loader2 className="w-12 h-12 text-[#0F6E56] mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Đang xác nhận thanh toán...</p>
          </div>
        )}

        {/* Success state */}
        {step === 'success' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#D4FF00]/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-[#0F6E56]" />
            </div>
            <p className="text-lg font-semibold text-gray-900 mb-2">Thanh toán thành công!</p>
            <p className="text-gray-500">Đang chuyển đến trang xác nhận...</p>
          </div>
        )}

        {/* QR Code step */}
        {step === 'qr' && checkoutData && (
          <SepayPaymentForm
            initUrl={checkoutData.initUrl}
            formFields={checkoutData.formFields}
            amount={total}
            onCancel={handleCancelQR}
          />
        )}

        {/* Loading QR */}
        {step === 'qr' && isLoading && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <Loader2 className="w-12 h-12 text-[#0F6E56] mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Đang khởi tạo thanh toán...</p>
          </div>
        )}

        {/* Payment method selection */}
        {step === 'select' && (
          <>
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
                        onChange={() => handleSelectMethod(opt.id)}
                        className="sr-only"
                      />

                      {/* Sepay icon */}
                      <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                        {opt.id === 'sepay' ? (
                          <QrCode className="w-5 h-5 text-green-600" />
                        ) : (
                          <svg viewBox="0 0 24 24" className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <rect x="2" y="6" width="20" height="12" rx="2" />
                            <circle cx="9" cy="12" r="1.5" fill="currentColor" />
                            <path d="M15 10h1.5M15 14h1.5M13 12h3" strokeLinecap="round" />
                          </svg>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{opt.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{opt.description}</p>
                      </div>

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

            {/* Cancellation reminder */}
            <div className="flex items-start gap-3 p-4 bg-[#D4FF00]/20 border border-[#0F6E56]/20 rounded-2xl">
              <Info className="w-4 h-4 text-[#0F6E56] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700 leading-relaxed">
                {CANCELLATION_NOTE}
              </p>
            </div>
          </>
        )}
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

          {/* Error message */}
          {errorMessage && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
          )}

          {/* CTA */}
          {step === 'select' && (
            <button
              onClick={handleConfirmPayment}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-[#0F6E56] hover:bg-[#0a5a45] disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-colors"
              style={{ height: 48 }}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {selectedMethod === 'sepay' ? 'Quét mã QR để thanh toán' : 'Xác nhận đặt sân'}
                </>
              )}
            </button>
          )}

          {/* Back link */}
          {step === 'select' && (
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
          )}

          {/* Terms note */}
          {step === 'select' && (
            <p className="text-center text-xs text-gray-400 leading-relaxed">
              Bằng cách đặt sân, bạn đồng ý với{' '}
              <span className="text-[#0F6E56] underline cursor-pointer">Điều khoản sử dụng</span>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
