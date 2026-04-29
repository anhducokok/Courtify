'use client';

/**
 * Example Component - Showcase Dashboard Components
 * 
 * Tệp này minh họa cách sử dụng tất cả các dashboard components
 * trong một trang hoàn chỉnh.
 */

import {
  DashboardLayout,
  StatCard,
  ChartCard,
  BarChart,
  LineChart,
  PieChart,
  RecentActivityCard,
  TopPerformersCard,
  FilterTabs,
} from '@/components/dashboard';
import {
  DollarSign,
  Users,
  MapPin,
  TrendingUp,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { useState } from 'react';

/**
 * Example page yang menunjukkan tất cả dashboard components
 * Bạn có thể sao chép và sửa đổi theo nhu cầu
 */
export function DashboardComponentsExample() {
  const [activeTimeFilter, setActiveTimeFilter] = useState('7d');

  // Example Stats Data
  const statsData = [
    {
      label: 'Tổng doanh thu',
      value: '128,450,000đ',
      icon: <DollarSign className="w-6 h-6" />,
      trend: { value: 23.8, isPositive: true },
      description: 'Tăng 23.8% so với tháng trước',
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

  // Example Chart Data
  const barChartData = [
    { label: 'T2', value: 4200 },
    { label: 'T3', value: 4500 },
    { label: 'T4', value: 3800 },
    { label: 'T5', value: 5200 },
    { label: 'T6', value: 4800 },
    { label: 'T7', value: 6100 },
    { label: 'CN', value: 5900 },
  ];

  const lineChartData = [
    { label: 'Tháng 1', value: 15000 },
    { label: 'Tháng 2', value: 18000 },
    { label: 'Tháng 3', value: 22000 },
    { label: 'Tháng 4', value: 25000 },
  ];

  const pieChartData = [
    { label: 'Phòng A', value: 156, color: '#0F6E56' },
    { label: 'Phòng B', value: 142, color: '#D4FF00' },
    { label: 'Phòng C', value: 128, color: '#3B82F6' },
  ];

  // Example Recent Activity
  const recentItems = [
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
  ];

  // Example Top Performers
  const topItems = [
    {
      rank: 1,
      name: 'Sân Badminton - Phòng A',
      value: '156 lượt đặt',
      icon: <MapPin className="w-4 h-4" />,
      trend: 15,
    },
    {
      rank: 2,
      name: 'Sân Badminton - Phòng B',
      value: '142 lượt đặt',
      icon: <MapPin className="w-4 h-4" />,
      trend: 12,
    },
  ];

  // Filter tabs
  const timeFilterTabs = [
    { id: '7d', label: '7 ngày', icon: <Calendar className="w-4 h-4" /> },
    { id: '30d', label: '30 ngày' },
    { id: 'yearly', label: 'Năm' },
  ];

  return (
    <DashboardLayout
      isAdmin={true}
      headerTitle="Dashboard Example"
      headerSubtitle="Showcase của tất cả dashboard components"
    >
      {/* Stats Section */}
      <section className="mb-8">
        <h2 className="text-lg font-bold font-lexend text-gray-900 mb-6">
          Key Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="mb-8">
        <h2 className="text-lg font-bold font-lexend text-gray-900 mb-6">
          Time Period Filter
        </h2>
        <FilterTabs
          tabs={timeFilterTabs}
          activeTab={activeTimeFilter}
          onTabChange={setActiveTimeFilter}
        />
      </section>

      {/* Charts Section */}
      <section className="mb-8">
        <h2 className="text-lg font-bold font-lexend text-gray-900 mb-6">
          Analytics Charts
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bar Chart */}
          <div className="lg:col-span-2">
            <ChartCard
              title="Booking Trends"
              description="Booking volume over the last 7 days"
              action={<button className="text-gray-600">Options</button>}
            >
              <BarChart data={barChartData} />
            </ChartCard>
          </div>

          {/* Line Chart */}
          <ChartCard title="Revenue Trend" description="Monthly revenue">
            <LineChart data={lineChartData} color="green" />
          </ChartCard>
        </div>
      </section>

      {/* Pie Chart Section */}
      <section className="mb-8">
        <h2 className="text-lg font-bold font-lexend text-gray-900 mb-6">
          Court Distribution
        </h2>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <PieChart data={pieChartData} />
        </div>
      </section>

      {/* Activity Section */}
      <section>
        <h2 className="text-lg font-bold font-lexend text-gray-900 mb-6">
          Recent Activity
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivityCard
            title="Recent Registrations"
            items={recentItems}
            viewAllLink="#"
          />

          <TopPerformersCard title="Top Performers" items={topItems} />
        </div>
      </section>
    </DashboardLayout>
  );
}
