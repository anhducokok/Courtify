'use client';

import { Bell, Search, Settings } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const { user } = useAuth();
  const displayName = user?.name || user?.email || 'User';
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="px-8 py-4 flex items-center justify-between">
        {/* Left: Title */}
        <div className="flex-1">
          {title && (
            <>
              <h1 className="text-2xl font-bold font-lexend text-[#1F4D2B]">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
              )}
            </>
          )}
        </div>

        {/* Right: Search, Notifications, Settings, Profile */}
        <div className="flex items-center gap-6">
          {/* Search Bar */}
          <div className="hidden md:flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2 border border-gray-200">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-40"
            />
          </div>

          {/* Notification Bell */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Settings */}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>

          {/* User Avatar */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4FF00] to-[#A8D700] flex items-center justify-center font-bold text-[#1F4D2B]">
              {initials}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">
                {displayName}
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
