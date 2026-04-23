'use client';

import { useState } from 'react';
import { HomeNavbar } from '@/components/home/navbar';
import { HeroSearch } from '@/components/home/hero-search';
import { FilterChips } from '@/components/home/filter-chips';
import { CourtCard, type Court } from '@/components/home/court-card';
import { MapPlaceholder } from '@/components/home/map-placeholder';

const COURTS: Court[] = [
  {
    id: '1',
    name: 'Sân Cầu Lông Smash Center',
    address: 'Quận 1, TP. Hồ Chí Minh',
    distance: '1.2km',
    rating: 4.8,
    pricePerHour: 85000,
    availableCourts: 3,
    totalCourts: 6,
    hasLED: false,
    tags: ['Giữ xe FREE', 'Wifi'],
    isNew: true,
  },
  {
    id: '2',
    name: 'Badminton Pro Hub',
    address: 'Quận Bình Thạnh, TP. HCM',
    distance: '2.8km',
    rating: 4.6,
    pricePerHour: 120000,
    availableCourts: 5,
    totalCourts: 10,
    hasLED: true,
    tags: ['Điều hoà', 'Shop dụng cụ'],
  },
  {
    id: '3',
    name: 'Green Court Arena',
    address: 'Quận 7, TP. HCM',
    distance: '4.1km',
    rating: 4.3,
    pricePerHour: 75000,
    availableCourts: 2,
    totalCourts: 8,
    hasLED: true,
    tags: ['Gửi xe miễn phí'],
  },
  {
    id: '4',
    name: 'SaigonBad Club',
    address: 'Quận Thủ Đức, TP. HCM',
    distance: '5.6km',
    rating: 4.5,
    pricePerHour: 95000,
    availableCourts: 4,
    totalCourts: 12,
    hasLED: true,
    tags: ['Phòng thay đồ', 'Wifi'],
  },
];

const MAP_PINS = [
  { id: '1', label: '85k · Smash Center', x: 38, y: 42 },
  { id: '2', label: '120k · Pro Hub', x: 62, y: 68 },
  { id: '3', label: '75k · Green Court', x: 25, y: 60 },
  { id: '4', label: '95k · SaigonBad', x: 70, y: 35 },
];

function applyFilter(courts: Court[], filter: string): Court[] {
  switch (filter) {
    case 'available': return courts.filter((c) => c.availableCourts > 0);
    case 'led': return courts.filter((c) => c.hasLED);
    case 'cheap': return courts.filter((c) => c.pricePerHour < 100000);
    case 'top-rated': return courts.filter((c) => c.rating >= 4.5);
    default: return courts;
  }
}

export default function HomePage() {
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState<string | undefined>();

  const visibleCourts = applyFilter(COURTS, filter);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HomeNavbar />
      <HeroSearch />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col gap-4">
        {/* Filter chips */}
        <FilterChips active={filter} onChange={setFilter} />

        {/* Two-column layout */}
        <div className="flex gap-6 flex-1">
          {/* Court list */}
          <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
            {visibleCourts.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-sm">
                Không tìm thấy sân phù hợp.
              </div>
            ) : (
              visibleCourts.map((court) => (
                <CourtCard
                  key={court.id}
                  court={court}
                  selected={selectedId === court.id}
                  onClick={() => setSelectedId(court.id === selectedId ? undefined : court.id)}
                />
              ))
            )}
          </div>

          {/* Map */}
          <div className="hidden lg:block w-[380px] shrink-0 sticky top-[72px] self-start">
            <MapPlaceholder pins={MAP_PINS} selectedId={selectedId} />
          </div>
        </div>
      </main>
    </div>
  );
}
