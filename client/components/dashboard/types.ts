/**
 * Dashboard Type Definitions
 * 
 * TypeScript interfaces and types for dashboard components
 */

import { ReactNode } from 'react';

// ============================================================================
// STAT CARD TYPES
// ============================================================================

export type StatCardBgColor = 'green' | 'lime' | 'blue' | 'purple' | 'orange';

export interface TrendData {
  value: number;
  isPositive: boolean;
}

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: TrendData;
  description?: string;
  bgColor?: StatCardBgColor;
}

// ============================================================================
// CHART TYPES
// ============================================================================

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface BarChartProps {
  data: ChartDataPoint[];
  maxValue?: number;
}

export type LineChartColor = 'green' | 'lime' | 'blue';

export interface LineChartProps {
  data: ChartDataPoint[];
  maxValue?: number;
  color?: LineChartColor;
}

export interface PieChartDataPoint extends ChartDataPoint {
  color: string;
}

export interface PieChartProps {
  data: PieChartDataPoint[];
}

export interface ChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

// ============================================================================
// ACTIVITY & PERFORMANCE TYPES
// ============================================================================

export type ActivityStatus = 'verified' | 'pending' | 'rejected';

export interface RecentItem {
  id: string;
  title: string;
  description: string;
  status: ActivityStatus;
  date: string;
  icon?: ReactNode;
}

export interface RecentActivityCardProps {
  title: string;
  items: RecentItem[];
  viewAllLink?: string;
}

export interface TopPerformer {
  rank: number;
  name: string;
  value: string | number;
  icon: ReactNode;
  trend?: number;
}

export interface TopPerformersCardProps {
  title: string;
  items: TopPerformer[];
}

// ============================================================================
// FILTER & NAVIGATION TYPES
// ============================================================================

export interface FilterTab {
  id: string;
  label: string;
  icon?: ReactNode;
}

export interface FilterTabsProps {
  tabs: FilterTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export interface SidebarItem {
  href: string;
  label: string;
  icon: ReactNode;
  role?: string[];
}

// ============================================================================
// LAYOUT TYPES
// ============================================================================

export interface DashboardLayoutProps {
  children: ReactNode;
  isAdmin?: boolean;
  headerTitle?: string;
  headerSubtitle?: string;
}

export interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
}

export interface AdminSidebarProps {
  isAdmin?: boolean;
}

// ============================================================================
// DASHBOARD DATA TYPES
// ============================================================================

export interface DashboardMetrics {
  totalRevenue: number;
  activeUsers: number;
  totalCourts: number;
  bookingRate: number;
}

export interface TimeFilter {
  id: string;
  label: string;
  days: number;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface DashboardApiResponse {
  stats: {
    totalRevenue: number;
    activeUsers: number;
    totalCourts: number;
    bookingTrend: {
      value: number;
      isPositive: boolean;
    };
  };
  charts: {
    bookingTrends: ChartDataPoint[];
    revenueTrends: ChartDataPoint[];
    distribution: PieChartDataPoint[];
  };
  activities: {
    recentBookings: RecentItem[];
    recentRegistrations: RecentItem[];
    topCourts: TopPerformer[];
  };
}

// ============================================================================
// ENUM TYPES
// ============================================================================

export enum DashboardRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum CourtStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  BANNED = 'banned',
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Either<L, R> = { type: 'left'; value: L } | { type: 'right'; value: R };

// ============================================================================
// HOOKS RETURN TYPES
// ============================================================================

export interface UseDashboardReturn {
  metrics: DashboardMetrics;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export interface UseFilterReturn {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  filteredData: ChartDataPoint[];
}
