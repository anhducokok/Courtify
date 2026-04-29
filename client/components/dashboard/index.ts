// Re-export dashboard components
export { AdminSidebar } from './admin-sidebar';
export { DashboardHeader } from './dashboard-header';
export { DashboardLayout } from './dashboard-layout';
export { StatCard } from './stat-card';
export { ChartCard } from './chart-card';
export { RecentActivityCard } from './recent-activity-card';
export { BarChart } from './bar-chart';
export { LineChart } from './line-chart';
export { PieChart } from './pie-chart';
export { TopPerformersCard } from './top-performers-card';
export { FilterTabs } from './filter-tabs';

// Re-export types
export type {
  StatCardProps,
  BarChartProps,
  LineChartProps,
  PieChartProps,
  ChartCardProps,
  RecentActivityCardProps,
  TopPerformersCardProps,
  FilterTabsProps,
  DashboardLayoutProps,
} from './types';

// Re-export hooks
export {
  useFilter,
  useChartData,
  useDashboardStats,
  usePaginatedList,
  useSortableList,
  useSearch,
  useLocalStorage,
  useDebounce,
  useAsync,
} from './hooks';

// Re-export config and constants
export { COLORS, STAT_CARD_COLORS, STATUS_COLORS } from './config';
