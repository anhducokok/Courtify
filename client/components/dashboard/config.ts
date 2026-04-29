/**
 * Dashboard Configuration & Constants
 * 
 * Centralized configuration for dashboard colors, sizes, and other constants
 */

// ============================================================================
// COLOR PALETTE
// ============================================================================

export const COLORS = {
  // Primary Colors
  forestGreen: {
    dark: '#1F4D2B',    // Deep forest green (darkest)
    medium: '#0F6E56',  // Medium forest green
    light: '#1a5f49',   // Light forest green
  },
  
  // Accent Colors
  limeGreen: {
    bright: '#D4FF00',  // Lime bright
    muted: '#A8D700',   // Lime muted
  },
  
  // Secondary Colors
  blue: '#3B82F6',
  purple: '#A855F7',
  orange: '#F97316',
  red: '#EF4444',
  green: '#22C55E',
  
  // Neutral Colors
  white: '#FFFFFF',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
};

// ============================================================================
// STAT CARD COLORS
// ============================================================================

export const STAT_CARD_COLORS = {
  green: {
    bg: 'bg-gradient-to-br from-[#0F6E56] to-[#1F4D2B]',
    text: 'text-white',
    icon: 'bg-white/20',
  },
  lime: {
    bg: 'bg-gradient-to-br from-[#D4FF00] to-[#A8D700]',
    text: 'text-[#1F4D2B]',
    icon: 'bg-white/30',
  },
  blue: {
    bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
    text: 'text-white',
    icon: 'bg-white/20',
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-500 to-purple-600',
    text: 'text-white',
    icon: 'bg-white/20',
  },
  orange: {
    bg: 'bg-gradient-to-br from-orange-500 to-orange-600',
    text: 'text-white',
    icon: 'bg-white/20',
  },
};

// ============================================================================
// STATUS BADGE COLORS
// ============================================================================

export const STATUS_COLORS = {
  verified: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    label: 'Xác nhận',
  },
  pending: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    label: 'Chờ xử lý',
  },
  rejected: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    label: 'Từ chối',
  },
};

// ============================================================================
// SIDEBAR CONFIGURATION
// ============================================================================

export const SIDEBAR_CONFIG = {
  width: 'w-64',
  background: 'bg-gradient-to-b from-[#1F4D2B] to-[#0F6E56]',
  textColor: 'text-white',
};

// ============================================================================
// HEADER CONFIGURATION
// ============================================================================

export const HEADER_CONFIG = {
  height: 'h-16',
  background: 'bg-white',
  borderColor: 'border-gray-100',
};

// ============================================================================
// GRID CONFIGURATIONS
// ============================================================================

export const GRID_CONFIG = {
  stats: {
    mobile: 'grid-cols-1',
    tablet: 'md:grid-cols-2',
    desktop: 'lg:grid-cols-4',
  },
  charts: {
    mobile: 'grid-cols-1',
    tablet: 'lg:grid-cols-2',
    fullWidth: 'lg:col-span-2',
  },
  activity: {
    mobile: 'grid-cols-1',
    desktop: 'lg:grid-cols-2',
  },
};

// ============================================================================
// SPACING CONFIGURATION
// ============================================================================

export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
};

// ============================================================================
// SIDEBAR NAVIGATION ITEMS
// ============================================================================

export const ADMIN_NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', href: '/admin/dashboard', icon: 'BarChart3' },
  { id: 'users', label: 'Người dùng', href: '/admin/users', icon: 'Users' },
  { id: 'courts', label: 'Sân vận động', href: '/admin/courts', icon: 'MapPin' },
  { id: 'reports', label: 'Báo cáo', href: '/admin/reports', icon: 'FileText' },
  { id: 'settings', label: 'Cài đặt', href: '/admin/settings', icon: 'Settings' },
];

export const MANAGER_NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', href: '/manager/dashboard', icon: 'BarChart3' },
  { id: 'courts', label: 'Sân của tôi', href: '/manager/courts', icon: 'MapPin' },
  { id: 'bookings', label: 'Đặt sân', href: '/manager/bookings', icon: 'FileText' },
  { id: 'analytics', label: 'Phân tích', href: '/manager/analytics', icon: 'BarChart3' },
  { id: 'settings', label: 'Cài đặt', href: '/manager/settings', icon: 'Settings' },
];

// ============================================================================
// TIME FILTER OPTIONS
// ============================================================================

export const TIME_FILTERS = [
  { id: '7d', label: '7 ngày', days: 7 },
  { id: '30d', label: '30 ngày', days: 30 },
  { id: '90d', label: '90 ngày', days: 90 },
  { id: 'yearly', label: 'Năm', days: 365 },
];

// ============================================================================
// ANIMATIONS
// ============================================================================

export const ANIMATION = {
  duration: {
    fast: '100ms',
    normal: '200ms',
    slow: '300ms',
  },
  timing: 'ease-in-out',
};

// ============================================================================
// CHART CONFIGURATION
// ============================================================================

export const CHART_CONFIG = {
  colors: {
    primary: COLORS.forestGreen.medium,
    secondary: COLORS.limeGreen.bright,
    accent: COLORS.blue,
  },
  height: {
    compact: '250px',
    normal: '300px',
    expanded: '400px',
  },
};

// ============================================================================
// RESPONSIVE BREAKPOINTS
// ============================================================================

export const BREAKPOINTS = {
  mobile: '640px',   // sm
  tablet: '768px',   // md
  desktop: '1024px', // lg
  wide: '1280px',    // xl
  ultraWide: '1536px', // 2xl
};
