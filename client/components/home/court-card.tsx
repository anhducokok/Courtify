'use client';

import { MapPin, Star } from 'lucide-react';

export interface Court {
  id: string;
  name: string;
  address?: string;
  distance?: string;
  rating?: number;
  minPrice: number;
  maxPrice: number;
  availableCourts?: number;
  totalCourts?: number;
  hasLED: boolean;
  tags?: string[];
  isNew?: boolean;
  bookingsCount?: number;
  date?: string;
}

interface CourtCardProps {
  court: Court;
  selected?: boolean;
  onClick?: () => void;
}

export function CourtCard({ court, selected = false, onClick }: CourtCardProps) {
  const minPrice = Number.isFinite(court.minPrice) ? court.minPrice : 0;
  const maxPrice = Number.isFinite(court.maxPrice) ? court.maxPrice : 0;

  // Determine status based on date and availability
  const isPast = (() => {
    if (!court.date) return false;
    const selectedDate = new Date(court.date);
    selectedDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate < today;
  })();
  const isFullyBooked = court.availableCourts !== undefined && court.availableCourts === 0;

  // Determine background and border colors
  const bgColor = isPast ? 'bg-gray-600' : isFullyBooked ? 'bg-orange-100' : 'bg-white';
  const borderColor = isPast 
    ? 'border-gray-500' 
    : isFullyBooked 
      ? 'border-orange-400' 
      : selected 
        ? 'border-[#0F6E56] border-2' 
        : 'border-gray-200 hover:border-gray-400';
  const textColor = isPast ? 'text-gray-100' : isFullyBooked ? 'text-gray-900' : 'text-gray-900';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPast}
      className={[
        'w-full text-left rounded-xl p-4 flex gap-4 transition-all',
        isPast ? 'cursor-not-allowed opacity-70' : 'cursor-pointer',
        bgColor,
        'border',
        borderColor,
      ].join(' ')}
    >
      {/* Thumbnail */}
      <div className="relative shrink-0">
        <div className={[
          'w-[72px] h-[72px] rounded-lg flex items-center justify-center overflow-hidden',
          isPast 
            ? 'bg-gray-500' 
            : isFullyBooked 
              ? 'bg-orange-200' 
              : 'bg-[#E8F5F0]',
        ].join(' ')}>
          <CourtDiagramIcon isPast={isPast} />
        </div>
        {court.isNew && !isPast && !isFullyBooked && (
          <span className="absolute -top-1.5 -left-1.5 bg-[#84cc16] text-white text-[9px] font-bold px-1 py-0.5 rounded">
            LỚI
          </span>
        )}
        {isPast && (
          <span className="absolute -top-1.5 -left-1.5 bg-gray-700 text-white text-[9px] font-bold px-1 py-0.5 rounded">
            QUÁ GIỜ
          </span>
        )}
        {isFullyBooked && !isPast && (
          <span className="absolute -top-1.5 -left-1.5 bg-orange-500 text-white text-[9px] font-bold px-1 py-0.5 rounded">
            ĐẦY
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold truncate ${textColor}`}>{court.name}</p>

        {(court.address || court.distance) && (
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className={`w-3 h-3 shrink-0 ${isPast ? 'text-gray-400' : 'text-gray-400'}`} />
            <p className={`text-xs truncate ${isPast ? 'text-gray-300' : 'text-gray-500'}`}>
              {[court.address, court.distance].filter(Boolean).join(' · ')}
            </p>
          </div>
        )}

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {court.availableCourts !== undefined && (
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
              isPast
                ? 'bg-gray-500 text-gray-100'
                : isFullyBooked
                  ? 'bg-orange-400 text-white'
                  : 'bg-[#E8F5F0] text-[#0F6E56]'
            }`}>
              {isFullyBooked ? `Đầy - 0 trống` : `${court.availableCourts || 0} trống`}
            </span>
          )}
          {court.totalCourts !== undefined && (
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
              isPast ? 'bg-gray-500 text-gray-100' : 'bg-gray-100 text-gray-500'
            }`}>
              {court.totalCourts} sân
            </span>
          )}
          {court.hasLED && (
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
              isPast ? 'bg-gray-500 text-gray-100' : 'bg-gray-100 text-gray-500'
            }`}>
              Đèn LED
            </span>
          )}
          {court.tags?.map((tag) => (
            <span key={tag} className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
              isPast ? 'bg-gray-500 text-gray-100' : 'bg-gray-100 text-gray-500'
            }`}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Price + Rating */}
      <div className="shrink-0 flex flex-col items-end justify-between">
        {court.rating !== undefined && (
          <div className={`flex items-center gap-0.5 ${isPast ? 'text-gray-400' : 'text-amber-400'}`}>
            <Star className={`w-3.5 h-3.5 ${isPast ? 'fill-gray-400' : 'fill-amber-400'}`} />
            <span className={`text-xs font-semibold ${isPast ? 'text-gray-400' : 'text-gray-700'}`}>{court.rating.toFixed(1)}</span>
          </div>
        )}

        <div className="text-right">
          {selected && !isPast && !isFullyBooked && (
            <p className="text-[10px] text-[#0F6E56] font-semibold mb-0.5">Đã chọn</p>
          )}
          <p className={`text-sm font-bold ${isPast ? 'text-gray-400' : isFullyBooked ? 'text-orange-500' : 'text-[#0F6E56]'}`}>
            {minPrice === maxPrice
              ? `${minPrice.toLocaleString('vi-VN')}đ`
              : `${minPrice.toLocaleString('vi-VN')}đ - ${maxPrice.toLocaleString('vi-VN')}đ`}
          </p>
          <p className={`text-[10px] ${isPast ? 'text-gray-400' : 'text-gray-400'}`}>/giờ</p>
        </div>
      </div>
    </button>
  );
}

function CourtDiagramIcon({ isPast }: { isPast?: boolean }) {
  const color = isPast ? '#999999' : '#0F6E56';
  const accentColor = isPast ? '#999999' : '#84cc16';

  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Court outer boundary */}
      <rect x="4" y="8" width="36" height="28" rx="1" stroke={color} strokeWidth="1.5" fill="none" />
      {/* Center line */}
      <line x1="22" y1="8" x2="22" y2="36" stroke={color} strokeWidth="1.5" />
      {/* Service lines */}
      <line x1="4" y1="22" x2="40" y2="22" stroke={color} strokeWidth="1" strokeDasharray="2 2" />
      {/* Net */}
      <line x1="22" y1="12" x2="22" y2="32" stroke={accentColor} strokeWidth="2" />
      {/* Shuttlecock */}
      <circle cx="33" cy="16" r="2" fill={accentColor} />
    </svg>
  );
}
