'use client';

import { MapPin, Star } from 'lucide-react';

export interface Court {
  id: string;
  name: string;
  address?: string;
  distance?: string;
  rating?: number;
  pricePerHour: number;
  availableCourts?: number;
  totalCourts?: number;
  hasLED: boolean;
  tags?: string[];
  isNew?: boolean;
}

interface CourtCardProps {
  court: Court;
  selected?: boolean;
  onClick?: () => void;
}

export function CourtCard({ court, selected = false, onClick }: CourtCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'w-full text-left bg-white rounded-xl p-4 flex gap-4 transition-all cursor-pointer',
        'border',
        selected
          ? 'border-[#0F6E56] border-2 shadow-sm'
          : 'border-gray-200 hover:border-gray-400',
      ].join(' ')}
    >
      {/* Thumbnail */}
      <div className="relative shrink-0">
        <div className="w-[72px] h-[72px] rounded-lg bg-[#E8F5F0] flex items-center justify-center overflow-hidden">
          <CourtDiagramIcon />
        </div>
        {court.isNew && (
          <span className="absolute -top-1.5 -left-1.5 bg-[#84cc16] text-white text-[9px] font-bold px-1 py-0.5 rounded">
            LỚI
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 truncate">{court.name}</p>

        {(court.address || court.distance) && (
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
            <p className="text-xs text-gray-500 truncate">
              {[court.address, court.distance].filter(Boolean).join(' · ')}
            </p>
          </div>
        )}

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {court.availableCourts !== undefined && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#E8F5F0] text-[#0F6E56] font-medium">
              {court.availableCourts} sân trống
            </span>
          )}
          {court.totalCourts !== undefined && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
              {court.totalCourts} sân
            </span>
          )}
          {court.hasLED && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
              Đèn LED
            </span>
          )}
          {court.tags?.map((tag) => (
            <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Price + Rating */}
      <div className="shrink-0 flex flex-col items-end justify-between">
        {court.rating !== undefined && (
          <div className="flex items-center gap-0.5 text-amber-400">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span className="text-xs font-semibold text-gray-700">{court.rating.toFixed(1)}</span>
          </div>
        )}

        <div className="text-right">
          {selected && (
            <p className="text-[10px] text-[#0F6E56] font-semibold mb-0.5">Đã chọn</p>
          )}
          <p className="text-sm font-bold text-[#0F6E56]">
            {court.pricePerHour.toLocaleString('vi-VN')}đ
          </p>
          <p className="text-[10px] text-gray-400">/giờ</p>
        </div>
      </div>
    </button>
  );
}

function CourtDiagramIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Court outer boundary */}
      <rect x="4" y="8" width="36" height="28" rx="1" stroke="#0F6E56" strokeWidth="1.5" fill="none" />
      {/* Center line */}
      <line x1="22" y1="8" x2="22" y2="36" stroke="#0F6E56" strokeWidth="1.5" />
      {/* Service lines */}
      <line x1="4" y1="22" x2="40" y2="22" stroke="#0F6E56" strokeWidth="1" strokeDasharray="2 2" />
      {/* Net */}
      <line x1="22" y1="12" x2="22" y2="32" stroke="#84cc16" strokeWidth="2" />
      {/* Shuttlecock */}
      <circle cx="33" cy="16" r="2" fill="#84cc16" />
    </svg>
  );
}
