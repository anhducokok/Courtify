'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Users,
  MapPin,
  FileText,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

interface SidebarItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  role?: string[];
}

interface AdminSidebarProps {
  isAdmin?: boolean;
}

export function AdminSidebar({ isAdmin = true }: AdminSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const router = useRouter();

  const sidebarItems: SidebarItem[] = isAdmin
    ? [
        {
          href: '/admin/dashboard',
          label: 'Dashboard',
          icon: <BarChart3 className="w-5 h-5" />,
        },
        {
          href: '/admin/users',
          label: 'Người dùng',
          icon: <Users className="w-5 h-5" />,
        },
        {
          href: '/admin/courts',
          label: 'Sân vận động',
          icon: <MapPin className="w-5 h-5" />,
        },
        {
          href: '/admin/reports',
          label: 'Báo cáo',
          icon: <FileText className="w-5 h-5" />,
        },
        {
          href: '/admin/settings',
          label: 'Cài đặt',
          icon: <Settings className="w-5 h-5" />,
        },
      ]
    : [
        {
          href: '/manager/dashboard',
          label: 'Dashboard',
          icon: <BarChart3 className="w-5 h-5" />,
        },
        {
          href: '/manager/courts',
          label: 'Sân của tôi',
          icon: <MapPin className="w-5 h-5" />,
        },
        {
          href: '/manager/bookings',
          label: 'Đặt sân',
          icon: <FileText className="w-5 h-5" />,
        },
        {
          href: '/manager/analytics',
          label: 'Phân tích',
          icon: <BarChart3 className="w-5 h-5" />,
        },
        {
          href: '/manager/settings',
          label: 'Cài đặt',
          icon: <Settings className="w-5 h-5" />,
        },
      ];

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <aside className="w-64 bg-gradient-to-b from-[#1F4D2B] to-[#0F6E56] text-white h-screen sticky top-0 overflow-y-auto flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#D4FF00] to-[#A8D700] flex items-center justify-center font-bold text-[#1F4D2B]">
            Z8
          </div>
          <div>
            <h1 className="text-lg font-bold font-lexend">Zen8labs</h1>
            <p className="text-xs text-white/60">
              {isAdmin ? 'Admin' : 'Manager'}
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-6 space-y-2">
        {sidebarItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium text-sm ${
              isActive(item.href)
                ? 'bg-[#D4FF00] text-[#1F4D2B] shadow-lg'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={async () => {
            await logout();
            router.push('/login');
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:bg-red-500/20 hover:text-red-300 transition-colors duration-200 font-medium text-sm"
        >
          <LogOut className="w-5 h-5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
