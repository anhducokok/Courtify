'use client';

import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { StatCard } from '@/components/dashboard/stat-card';
import { ChartCard } from '@/components/dashboard/chart-card';
import { RecentActivityCard } from '@/components/dashboard/recent-activity-card';
import { BarChart } from '@/components/dashboard/bar-chart';
import { LineChart } from '@/components/dashboard/line-chart';
import {
  DollarSign,
  Users,
  MapPin,
  BarChart3,
  MoreVertical,
} from 'lucide-react';

export default function ManagerDashboard() {
  // Mock data for manager
  const stats = [
    {
      label: 'Tổng doanh thu',
      value: '45,320,000đ',
      icon: <DollarSign className="w-6 h-6" />,
      trend: { value: 15.3, isPositive: true },
      bgColor: 'green' as const,
    },
    {
      label: 'Lượng đặt sân',
      value: '342',
      icon: <BarChart3 className="w-6 h-6" />,
      trend: { value: 12.5, isPositive: true },
      bgColor: 'lime' as const,
    },
    {
      label: 'Khách hàng hoạt động',
      value: '238',
      icon: <Users className="w-6 h-6" />,
      trend: { value: 8.2, isPositive: true },
      bgColor: 'blue' as const,
    },
    {
      label: 'Sân của tôi',
      value: '5',
      icon: <MapPin className="w-6 h-6" />,
      trend: { value: 0, isPositive: true },
      bgColor: 'purple' as const,
    },
  ];

  const monthlyBookings = [
    { label: 'Tháng 1', value: 28 },
    { label: 'Tháng 2', value: 35 },
    { label: 'Tháng 3', value: 42 },
    { label: 'Tháng 4', value: 38 },
  ];

  const dailyBookings = [
    { label: 'T2', value: 12 },
    { label: 'T3', value: 15 },
    { label: 'T4', value: 10 },
    { label: 'T5', value: 18 },
    { label: 'T6', value: 14 },
    { label: 'T7', value: 22 },
    { label: 'CN', value: 20 },
  ];

  const recentBookings = [
    {
      id: '1',
      title: 'Đặt sân - Phòng A',
      description: 'Nguyễn Văn A đã đặt sân thành công',
      status: 'verified' as const,
      date: '30 phút trước',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: '2',
      title: 'Đặt sân - Phòng B',
      description: 'Trần Thế B đang chờ xác nhận thanh toán',
      status: 'pending' as const,
      date: '1 giờ trước',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: '3',
      title: 'Đặt sân - Phòng A',
      description: 'Lê Văn C đã hủy đặt sân',
      status: 'rejected' as const,
      date: '2 giờ trước',
      icon: <BarChart3 className="w-4 h-4" />,
    },
  ];

  const topCourts = [
    {
      id: '1',
      title: 'Sân Badminton - Phòng A',
      description: '156 lượt đặt trong tháng',
      status: 'verified' as const,
      date: 'Trung bình 5 sao',
      icon: <MapPin className="w-4 h-4" />,
    },
    {
      id: '2',
      title: 'Sân Badminton - Phòng B',
      description: '142 lượt đặt trong tháng',
      status: 'verified' as const,
      date: 'Trung bình 4.8 sao',
      icon: <MapPin className="w-4 h-4" />,
    },
    {
      id: '3',
      title: 'Sân Badminton - Phòng C',
      description: '128 lượt đặt trong tháng',
      status: 'verified' as const,
      date: 'Trung bình 4.6 sao',
      icon: <MapPin className="w-4 h-4" />,
    },
  ];

  return (
    <DashboardLayout isAdmin={false} headerTitle="Dashboard quản lý">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Monthly Bookings */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Đặt sân hàng ngày"
            description="Tổng quan về lượng đặt sân trong tuần"
            action={
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            }
          >
            <BarChart data={dailyBookings} />
          </ChartCard>
        </div>

        {/* Revenue Trend */}
        <ChartCard
          title="Doanh thu hàng tháng"
          description="Xu hướng doanh thu qua các tháng"
        >
          <LineChart data={monthlyBookings} color="lime" />
        </ChartCard>
      </div>

      {/* Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <RecentActivityCard
          title="Đặt sân gần đây"
          items={recentBookings}
          viewAllLink="/manager/bookings"
        />

        {/* Top Courts */}
        <RecentActivityCard
          title="Sân phổ biến nhất"
          items={topCourts}
          viewAllLink="/manager/courts"
        />
      </div>
    </DashboardLayout>
  );
}
