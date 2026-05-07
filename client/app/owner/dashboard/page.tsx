'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { LayoutDashboard, MapPin, CalendarDays, TrendingUp, Star, Clock, BadgeCheck } from 'lucide-react';
import { OwnerStatCard } from '@/components/owner/owner-stat-card';
import { RevenueBarChart } from '@/components/owner/revenue-bar-chart';
import { BookingTimeline } from '@/components/owner/booking-timeline';
import { PendingBookingsCard } from '@/components/owner/pending-bookings-card';
import Link from 'next/link';

const REVENUE_DATA = [
  { label: 'T2', morning: 200, afternoon: 150, evening: 400 },
  { label: 'T3', morning: 150, afternoon: 200, evening: 350 },
  { label: 'T4', morning: 250, afternoon: 180, evening: 420 },
  { label: 'T5', morning: 180, afternoon: 220, evening: 380 },
  { label: 'T6', morning: 300, afternoon: 250, evening: 500 },
  { label: 'T7', morning: 350, afternoon: 300, evening: 580 },
  { label: 'CN', morning: 280, afternoon: 220, evening: 460 },
];

const TIMELINE_SLOTS = [
  { time: '06:00', courtA1: { name: 'Nguyễn Văn A', phone: '0901...' }, courtA2: { name: 'Trần Thị B', phone: '0912...' } },
  { time: '07:00', courtA1: { name: 'Lê Văn C', phone: '0933...' }, courtA2: { name: 'Phạm Thị D', phone: '0944...' }, courtA3: { name: 'Hoàng Văn E', phone: '0955...' } },
  { time: '08:00', courtA1: { name: 'Nguyễn Văn A', phone: '0901...' } },
  { time: '09:00' },
  { time: '10:00', courtA3: { name: 'Đặng Văn F', phone: '0966...' } },
  { time: '11:00' },
  { time: '12:00', courtA1: { name: 'Vũ Thị G', phone: '0977...' }, courtA4: { name: 'Bùi Văn H', phone: '0988...' } },
  { time: '13:00', courtA1: { name: 'Đinh Văn I', phone: '0999...' } },
  { time: '14:00', courtA2: { name: 'Lý Thị K', phone: '0900...' } },
  { time: '15:00' },
  { time: '16:00', courtA5: { name: 'Trương Văn L', phone: '0911...' }, courtA6: { name: 'Ngô Thị M', phone: '0922...' } },
  { time: '17:00', courtA1: { name: 'Hà Văn N', phone: '0933...' }, courtA2: { name: 'Cao Thị P', phone: '0944...' }, courtA3: { name: 'Phí Văn Q', phone: '0955...' } },
  { time: '18:00', courtA4: { name: 'Trịnh Thị R', phone: '0966...' } },
  { time: '19:00', courtA1: { name: 'Lưu Văn S', phone: '0977...' }, courtA5: { name: 'Đào Thị T', phone: '0988...' }, courtA6: { name: 'Võ Văn U', phone: '0999...' } },
  { time: '20:00', courtA2: { name: 'Bạch Văn V', phone: '0901...' }, courtA3: { name: 'Phan Thị X', phone: '0912...' } },
  { time: '21:00', courtA1: { name: 'Hứa Văn Y', phone: '0933...' } },
  { time: '22:00' },
];

const PENDING_BOOKINGS = [
  { id: '1', customerName: 'Nguyễn Văn Minh', phone: '0901 234 567', date: '24/04/2025', time: '17:00 – 18:00', court: 'A1', price: '120.000đ' },
  { id: '2', customerName: 'Trần Thị Lan', phone: '0912 345 678', date: '24/04/2025', time: '18:00 – 19:00', court: 'A3', price: '150.000đ' },
  { id: '3', customerName: 'Lê Hoàng Phong', phone: '0934 567 890', date: '24/04/2025', time: '19:00 – 20:00', court: 'A5', price: '120.000đ' },
];

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-3.5 h-3.5 ${i < Math.round(value) ? 'text-[#D4FF00]' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function OwnerDashboardPage() {
  const { user, isLoading, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && !user) {
      router.replace('/login');
    }
  }, [isInitialized, user, router]);

  const handleConfirm = (id: string) => console.log('confirm', id);
  const handleReject = (id: string) => console.log('reject', id);

  if (isLoading || !isInitialized || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#2d6a4f] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-lexend text-[#085041]">Tổng quan hôm nay</h1>
          <p className="text-sm text-gray-400 mt-0.5">Thứ 5, 24/04/2025</p>
        </div>
        <Link
          href="/owner/bookings"
          className="flex items-center gap-2 px-4 py-2 bg-[#0F6E56] hover:bg-[#085041] text-white text-sm font-semibold rounded-lg transition-colors"
        >
          + Thêm đặt sân
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <OwnerStatCard
          icon={<MapPin className="w-5 h-5" />}
          label="Lượt đặt hôm nay"
          value="12 / 18 sân"
          subtext="67% lấp đầy"
          accent="green"
        />
        <OwnerStatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Doanh thu hôm nay"
          value="960.000đ"
          subtext="+12% so với hôm qua"
          accent="green"
        />
        <OwnerStatCard
          icon={<Clock className="w-5 h-5" />}
          label="Đang chờ xác nhận"
          value="3 lượt"
          subtext="Cần xử lý"
          accent="amber"
        />
        <OwnerStatCard
          icon={<Star className="w-5 h-5" />}
          label="Đánh giá trung bình"
          value="4.8 / 5"
          subtext=""
          accent="lime"
        />
        <div className="col-span-2 lg:col-span-4 flex items-center gap-3">
          <StarRating value={4.8} />
          <span className="text-sm text-gray-500 font-medium">Từ 48 đánh giá</span>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
        <h2 className="text-sm font-bold font-lexend text-gray-800 mb-1">Doanh thu 7 ngày qua</h2>
        <p className="text-xs text-gray-400 mb-4">Sáng / Chiều / Tối (nghìn đồng)</p>
        <RevenueBarChart data={REVENUE_DATA} />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Timeline */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold font-lexend text-gray-800">Lịch đặt hôm nay</h2>
            <Link href="/owner/bookings" className="text-xs text-[#0F6E56] font-medium hover:underline">
              Xem tất cả →
            </Link>
          </div>
          <BookingTimeline slots={TIMELINE_SLOTS} />
        </div>

        {/* Pending */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 px-5 py-4">
          <PendingBookingsCard
            bookings={PENDING_BOOKINGS}
            onConfirm={handleConfirm}
            onReject={handleReject}
          />
        </div>
      </div>
    </div>
  );
}
