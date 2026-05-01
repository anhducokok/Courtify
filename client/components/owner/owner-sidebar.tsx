'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MapPin,
  CalendarDays,
  TrendingUp,
  Star,
  Settings,
  LogOut,
  Eye,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

const SIDEBAR_ITEMS = [
  { href: '/owner/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/owner/courts', label: 'Quản lý sân', icon: MapPin },
  { href: '/owner/bookings', label: 'Lịch đặt sân', icon: CalendarDays },
  { href: '/owner/revenue', label: 'Doanh thu', icon: TrendingUp },
  { href: '/owner/reviews', label: 'Đánh giá', icon: Star },
  { href: '/owner/settings', label: 'Cài đặt', icon: Settings },
];

export function OwnerSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  const initials = 'TN';
  const ownerName = 'Trần Nam';

  return (
    <aside className="w-[220px] bg-[#085041] flex flex-col h-screen sticky top-0 overflow-y-auto">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-[#D4FF00] font-extrabold text-xl font-lexend leading-none">
            SmashBook
          </span>
        </div>
        <p className="text-white/60 text-xs mt-0.5 font-medium">Quản lý sân</p>
      </div>

      {/* Avatar + Info */}
      <div className="px-4 py-3 mx-3 rounded-xl bg-white/5 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#D4FF00] flex items-center justify-center flex-shrink-0">
            <span className="text-[#085041] font-bold text-sm">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{ownerName}</p>
            <span className="inline-flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#97C459]" />
              <span className="text-white/60 text-xs">Chủ sân</span>
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {SIDEBAR_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                relative
                ${
                  active
                    ? 'text-white bg-white/10'
                    : 'text-white/75 hover:text-white hover:bg-white/5'
                }
              `}
            >
              {active && (
                <span className="absolute left-0 top-1 bottom-1 w-0.5 rounded-r bg-[#97C459]" />
              )}
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 space-y-1 border-t border-white/10">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 text-white/50 hover:text-white/75 text-xs transition-colors rounded-lg hover:bg-white/5"
        >
          <Eye className="w-[15px] h-[15px]" />
          Xem trang khách
        </Link>
        <button
          onClick={async () => {
            await logout();
            router.push('/login');
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-white/50 hover:text-white/75 text-xs transition-colors rounded-lg hover:bg-white/5"
        >
          <LogOut className="w-[15px] h-[15px]" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
