'use client';

import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface OwnerStatCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  subtext: string;
  accent?: 'green' | 'amber' | 'lime';
}

const accentMap = {
  green: 'border-[#0F6E56]/20',
  amber: 'border-amber-200',
  lime: 'border-[#97C459]/30',
};

const iconWrapMap = {
  green: 'bg-[#0F6E56]/10 text-[#0F6E56]',
  amber: 'bg-amber-50 text-amber-600',
  lime: 'bg-[#97C459]/15 text-[#085041]',
};

const valueColorMap = {
  green: 'text-[#0F6E56]',
  amber: 'text-amber-600',
  lime: 'text-[#0F6E56]',
};

const trendUp = (val: string) =>
  val.startsWith('+') ? (
    <span className="flex items-center gap-0.5 text-xs font-semibold text-green-600">
      <TrendingUp className="w-3 h-3" />
      {val}
    </span>
  ) : val.startsWith('-') ? (
    <span className="flex items-center gap-0.5 text-xs font-semibold text-red-500">
      <TrendingDown className="w-3 h-3" />
      {val}
    </span>
  ) : null;

export function OwnerStatCard({
  icon,
  label,
  value,
  subtext,
  accent = 'green',
}: OwnerStatCardProps) {
  return (
    <div
      className={`bg-white rounded-xl border px-5 py-4 flex items-start gap-4 ${accentMap[accent]}`}
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconWrapMap[accent]}`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
        <p className={`text-2xl font-bold font-lexend ${valueColorMap[accent]}`}>
          {value}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          {trendUp(subtext) ?? (
            <span className="text-xs text-gray-400 font-medium">{subtext}</span>
          )}
        </div>
      </div>
    </div>
  );
}
