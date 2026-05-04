'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useBooking } from '@/components/booking/booking-context';
import { BookingSummaryCard } from '@/components/booking/booking-summary-card';
import {
  Phone,
  Mail,
  FileText,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  User,
  Loader2,
} from 'lucide-react';

const CANCELLATION_POLICY = `Quý khách vui lòng hủy sân trước giờ đặt ít nhất 24 giờ để được hoàn tiền 100%.
Hủy trong vòng 12–24 giờ trước giờ đặt: hoàn 50%.
Hủy trong vòng dưới 12 giờ: không hoàn tiền.
Thay đổi thời gian đặt sân vui lòng liên hệ trực tiếp với chủ sân.`;

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function maskPhone(phone: string): string {
  if (phone.length < 7) return phone;
  return phone.slice(0, 3) + '*'.repeat(phone.length - 5) + phone.slice(-2);
}

export default function BookingInfoPage() {
  const { user } = useAuth();
  const { state, updateContact } = useBooking();
  const router = useRouter();

  const [name, setName] = useState(state.contact.name);
  const [phone, setPhone] = useState(state.contact.phone);
  const [email, setEmail] = useState(state.contact.email);
  const [note, setNote] = useState(state.contact.note);
  const [saveInfo, setSaveInfo] = useState(state.contact.saveInfo);
  const [policyOpen, setPolicyOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const phoneMasked = maskPhone(phone);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Vui lòng nhập họ và tên.';
    if (!phone.trim()) errs.phone = 'Vui lòng nhập số điện thoại.';
    else if (!/^[0-9+\s-]{9,}$/.test(phone.replace(/\s/g, '')))
      errs.phone = 'Số điện thoại không hợp lệ.';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = 'Email không hợp lệ.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    updateContact({ name, phone, email, note, saveInfo });
    await new Promise((r) => setTimeout(r, 400));
    setSubmitting(false);
    router.push('/booking/payment');
  };

  const userInitials = getInitials(name || user?.name || 'U');

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── LEFT: Thông tin người đặt ─────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Section title */}
          <div>
            <h2 className="text-xl font-bold font-lexend text-gray-900">
              Thông tin người đặt
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Thông tin này sẽ được gửi đến chủ sân để xác nhận đặt sân.
            </p>
          </div>

          {/* Login banner */}
          <div className="flex items-start gap-3 p-3 pl-4 bg-[#D4FF00]/20 border-l-4 border-[#0F6E56] rounded-r-lg">
            <div className="w-9 h-9 rounded-full bg-[#0F6E56] flex items-center justify-center flex-shrink-0 text-white text-xs font-bold font-lexend">
              {userInitials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800">
                Bạn đang đăng nhập với số {phoneMasked}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Thông tin đã được điền sẵn từ tài khoản của bạn.
              </p>
            </div>
          </div>

          {/* Form fields */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">

            {/* Họ và tên */}
            <div>
              <label
                htmlFor="contact-name"
                className="block text-sm font-semibold text-gray-800 mb-1.5"
              >
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="contact-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((p) => ({ ...p, name: '' }));
                  }}
                  placeholder="VD: Nguyễn Văn A"
                  className={[
                    'w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-gray-900',
                    'placeholder:text-gray-400 bg-white',
                    'focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent',
                    'transition-colors',
                    errors.name ? 'border-red-400 bg-red-50/30' : 'border-gray-200',
                  ].join(' ')}
                  style={{ height: 40 }}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Số điện thoại */}
            <div>
              <label
                htmlFor="contact-phone"
                className="block text-sm font-semibold text-gray-800 mb-1.5"
              >
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="contact-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors((p) => ({ ...p, phone: '' }));
                  }}
                  placeholder="0901 234 567"
                  className={[
                    'w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900',
                    'placeholder:text-gray-400 bg-white',
                    'focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent',
                    'transition-colors',
                    errors.phone ? 'border-red-400 bg-red-50/30' : 'border-gray-200',
                  ].join(' ')}
                  style={{ height: 40 }}
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="contact-email"
                  className="block text-sm font-semibold text-gray-800"
                >
                  Email
                </label>
                <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-wide">
                  Tùy chọn
                </span>
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((p) => ({ ...p, email: '' }));
                  }}
                  placeholder="VD: email@example.com"
                  className={[
                    'w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900',
                    'placeholder:text-gray-400 bg-white',
                    'focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent',
                    'transition-colors',
                    errors.email ? 'border-red-400 bg-red-50/30' : 'border-gray-200',
                  ].join(' ')}
                  style={{ height: 40 }}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Ghi chú */}
            <div>
              <label
                htmlFor="contact-note"
                className="block text-sm font-semibold text-gray-800 mb-1.5"
              >
                Ghi chú / yêu cầu đặc biệt
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                <textarea
                  id="contact-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="VD: cần thêm bóng cầu lông, mượn vợt, chỗ để xe..."
                  rows={3}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent transition-colors resize-none"
                />
              </div>
            </div>

            {/* Save info checkbox */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={saveInfo}
                  onChange={(e) => setSaveInfo(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={[
                    'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all',
                    saveInfo
                      ? 'bg-[#0F6E56] border-[#0F6E56]'
                      : 'bg-white border-gray-300',
                  ].join(' ')}
                >
                  {saveInfo && (
                    <svg viewBox="0 0 12 9" className="w-3 h-2.5">
                      <path
                        d="M1 4L4.5 7.5L11 1"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm text-gray-700">
                Lưu thông tin cho lần đặt tiếp theo
              </span>
            </label>

          </div>

          {/* Cancellation policy accordion */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setPolicyOpen((o) => !o)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#0F6E56] flex-shrink-0" />
                <span className="text-sm font-semibold text-gray-800">
                  Chính sách hủy sân
                </span>
              </div>
              {policyOpen ? (
                <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
              )}
            </button>

            {policyOpen && (
              <div className="px-5 pb-5">
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {CANCELLATION_POLICY}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Booking Summary ─────────────────────────────── */}
        <div className="w-full lg:w-96 lg:shrink-0">
          <div className="lg:sticky lg:top-6 space-y-3">
            <BookingSummaryCard
              court={state.court}
              contactName={name}
              contactPhone={phone}
              showSubtotal
              subtotal={state.pricing.subtotal}
              serviceFee={state.pricing.serviceFee}
              total={state.pricing.total}
            />

            {/* CTA */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-[#0F6E56] hover:bg-[#0a5a45] disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-colors"
              style={{ height: 44 }}
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Tiếp theo
                  <svg viewBox="0 0 16 16" className="w-4 h-4 flex-shrink-0">
                    <path
                      d="M3 8h10M9 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                </>
              )}
            </button>

            {/* Back link */}
            <button
              type="button"
              onClick={() => router.back()}
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
              Quay lại bước 1
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
