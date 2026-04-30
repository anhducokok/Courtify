'use client';

import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface RecentItem {
  id: string;
  title: string;
  description: string;
  status: 'verified' | 'pending' | 'rejected';
  date: string;
  icon?: React.ReactNode;
}

interface RecentActivityCardProps {
  title: string;
  items: RecentItem[];
  viewAllLink?: string;
}

const statusConfig = {
  verified: {
    label: 'Xác nhận',
    className: 'bg-green-100 text-green-800',
  },
  pending: {
    label: 'Chờ xử lý',
    className: 'bg-yellow-100 text-yellow-800',
  },
  rejected: {
    label: 'Từ chối',
    className: 'bg-red-100 text-red-800',
  },
};

export function RecentActivityCard({
  title,
  items,
  viewAllLink,
}: RecentActivityCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold font-lexend text-gray-900">
          {title}
        </h3>
        {viewAllLink && (
          <Link
            href={viewAllLink}
            className="text-sm font-semibold text-[#0F6E56] hover:text-[#1F4D2B] flex items-center gap-1 transition-colors"
          >
            Xem tất cả
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`flex items-start gap-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors ${
              index < items.length - 1 ? '' : ''
            }`}
          >
            {/* Icon */}
            {item.icon && (
              <div className="flex-shrink-0 text-[#0F6E56]">{item.icon}</div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="text-sm font-semibold text-gray-900 truncate">
                  {item.title}
                </h4>
                <Badge
                  className={`text-xs px-2 py-1 whitespace-nowrap ${
                    statusConfig[item.status].className
                  }`}
                >
                  {statusConfig[item.status].label}
                </Badge>
              </div>
              <p className="text-xs text-gray-600 truncate">
                {item.description}
              </p>
              <p className="text-xs text-gray-400 mt-2">{item.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
