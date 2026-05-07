'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
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
  TrendingUp,
  MoreVertical,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, isLoading, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && !user) {
      router.replace('/login');
    }
  }, [isInitialized, user, router]);

  if (isLoading || !isInitialized || !user) {
    return (
      <DashboardLayout headerTitle="Admin Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-[#2d6a4f] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-500">Đang tải...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Mock data
  const stats = [
    {
      label: 'Tổng doanh thu',
      value: '128,450,000đ',
      icon: <DollarSign className="w-6 h-6" />,
      trend: { value: 23.8, isPositive: true },
      bgColor: 'green' as const,
    },
    {
      label: 'Người dùng hoạt động',
      value: '1,248',
      icon: <Users className="w-6 h-6" />,
      trend: { value: 18.2, isPositive: true },
      bgColor: 'blue' as const,
    },
    {
      label: 'Sân vận động',
      value: '4,821',
      icon: <MapPin className="w-6 h-6" />,
      trend: { value: 12.7, isPositive: true },
      bgColor: 'purple' as const,
    },
    {
      label: 'Tỉ lệ ưu tiên',
      value: '24',
      icon: <TrendingUp className="w-6 h-6" />,
      trend: { value: 3.2, isPositive: false },
      bgColor: 'orange' as const,
    },
  ];

  const bookingTrendData = [
    { label: 'T2', value: 4200 },
    { label: 'T3', value: 4500 },
    { label: 'T4', value: 3800 },
    { label: 'T5', value: 5200 },
    { label: 'T6', value: 4800 },
    { label: 'T7', value: 6100 },
    { label: 'CN', value: 5900 },
  ];

  const revenueData = [
    { label: 'Tháng 1', value: 15000 },
    { label: 'Tháng 2', value: 18000 },
    { label: 'Tháng 3', value: 22000 },
    { label: 'Tháng 4', value: 25000 },
  ];

  const recentRegistrations = [
    {
      id: '1',
      title: 'Ace Pro - Badminton Center',
      description: 'Sân vận động của Nguyễn Văn A',
      status: 'verified' as const,
      date: '24 tháng 10, 2023',
      icon: <MapPin className="w-4 h-4" />,
    },
    {
      id: '2',
      title: 'Sunrise Sports Center',
      description: 'Sân vận động của Trần Thế B',
      status: 'pending' as const,
      date: '23 tháng 10, 2023',
      icon: <MapPin className="w-4 h-4" />,
    },
    {
      id: '3',
      title: 'The Smash Arena',
      description: 'Sân vận động của Lê Văn C',
      status: 'verified' as const,
      date: '22 tháng 10, 2023',
      icon: <MapPin className="w-4 h-4" />,
    },
  ];

  const bookingIssues = [
    {
      id: '1',
      title: 'Lỗi thanh toán',
      description: 'Vấn đề thanh toán không hoàn tất cho đặt sân',
      status: 'pending' as const,
      date: '1 giờ trước',
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: '2',
      title: 'Xung đột đặt sân kép',
      description: 'Xung đột giữa hai đặt sân trong cùng một khoảng thời gian',
      status: 'pending' as const,
      date: '5 giờ trước',
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: '3',
      title: 'Yêu cầu hoàn tiền',
      description: 'Yêu cầu hoàn tiền cho lịch sử đặt sân trước đó',
      status: 'verified' as const,
      date: '1 ngày trước',
      icon: <TrendingUp className="w-4 h-4" />,
    },
  ];

  return (
    <DashboardLayout headerTitle="Admin Dashboard" headerSubtitle="Quản lý hệ thống">
      <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Booking Trends */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Xu hướng đặt sân"
            description="Tổng quan về khối lượng đặt sân trong 30 ngày qua"
            action={
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            }
          >
            <BarChart data={bookingTrendData} />
          </ChartCard>
        </div>

        {/* Revenue Chart */}
        <ChartCard
          title="Doanh thu"
          description="Doanh thu theo tháng (triệu đồng)"
        >
          <LineChart data={revenueData} color="green" />
        </ChartCard>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Court Registrations */}
        <RecentActivityCard
          title="Đăng ký sân vận động"
          items={recentRegistrations}
          viewAllLink="/admin/courts"
        />

        {/* Booking Issues */}
        <RecentActivityCard
          title="Vấn đề đặt sân"
          items={bookingIssues}
          viewAllLink="/admin/reports"
        />
      </div>
      </>
    </DashboardLayout>
  );
}
