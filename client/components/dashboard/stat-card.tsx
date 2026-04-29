'use client';

import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  bgColor?: 'green' | 'lime' | 'blue' | 'purple' | 'orange';
}

const bgColorMap = {
  green: 'bg-gradient-to-br from-[#0F6E56] to-[#1F4D2B]',
  lime: 'bg-gradient-to-br from-[#D4FF00] to-[#A8D700]',
  blue: 'bg-gradient-to-br from-blue-500 to-blue-600',
  purple: 'bg-gradient-to-br from-purple-500 to-purple-600',
  orange: 'bg-gradient-to-br from-orange-500 to-orange-600',
};

const textColorMap = {
  green: 'text-white',
  lime: 'text-[#1F4D2B]',
  blue: 'text-white',
  purple: 'text-white',
  orange: 'text-white',
};

const iconBgMap = {
  green: 'bg-white/20',
  lime: 'bg-white/30',
  blue: 'bg-white/20',
  purple: 'bg-white/20',
  orange: 'bg-white/20',
};

export function StatCard({
  label,
  value,
  icon,
  trend,
  description,
  bgColor = 'green',
}: StatCardProps) {
  return (
    <div
      className={`${bgColorMap[bgColor]} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-200`}
    >
      {/* Icon and Header */}
      <div className="flex items-start justify-between mb-4">
        <div className={`${iconBgMap[bgColor]} p-3 rounded-lg`}>{icon}</div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-sm font-semibold ${
              trend.isPositive ? 'text-green-300' : 'text-red-300'
            }`}
          >
            {trend.isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {trend.value}%
          </div>
        )}
      </div>

      {/* Value and Label */}
      <div>
        <p className="text-3xl font-bold font-lexend mb-1">{value}</p>
        <p
          className={`text-sm ${
            bgColor === 'lime' ? 'text-[#1F4D2B]/70' : 'text-white/80'
          } font-medium`}
        >
          {label}
        </p>
        {description && (
          <p
            className={`text-xs mt-2 ${
              bgColor === 'lime' ? 'text-[#1F4D2B]/60' : 'text-white/60'
            }`}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
