'use client';

import { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  description,
  children,
  action,
  className = '',
}: ChartCardProps) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h3 className="text-lg font-bold font-lexend text-gray-900">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>

      {/* Chart Content */}
      <div className="min-h-[300px]">{children}</div>
    </div>
  );
}
