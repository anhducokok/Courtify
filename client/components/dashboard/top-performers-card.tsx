'use client';

import { ReactNode } from 'react';
import { ArrowUp } from 'lucide-react';

interface TopPerformer {
  rank: number;
  name: string;
  value: string | number;
  icon: ReactNode;
  trend?: number;
}

interface TopPerformersCardProps {
  title: string;
  items: TopPerformer[];
}

export function TopPerformersCard({ title, items }: TopPerformersCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
      {/* Header */}
      <h3 className="text-lg font-bold font-lexend text-gray-900 mb-6">
        {title}
      </h3>

      {/* List */}
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.rank} className="flex items-center gap-4">
            {/* Rank Badge */}
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#0F6E56] to-[#1F4D2B] text-white font-bold text-sm">
              {item.rank}
            </div>

            {/* Icon */}
            <div className="flex-shrink-0 text-[#0F6E56]">{item.icon}</div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {item.name}
              </p>
              <p className="text-xs text-gray-500">{item.value}</p>
            </div>

            {/* Trend */}
            {item.trend && (
              <div className="flex items-center gap-1 text-green-600 font-semibold text-sm">
                <ArrowUp className="w-4 h-4" />
                {item.trend}%
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
