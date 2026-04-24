'use client';

import { useState } from 'react';
import { HomeNavbar } from '@/components/home/navbar';
import { HeroSearch } from '@/components/home/hero-search';
import { FilterChips } from '@/components/home/filter-chips';
import { CourtCard, type Court } from '@/components/home/court-card';
import { CourtMap } from '@/components/home/court-map';
import { useCourts } from '@/hooks/use-courts';
import { Footer } from '@/components/home/footer';
import type { ApiCourt, QueryCourtsParams } from '@/types/court';

function toCourtCard(c: ApiCourt): Court {
  return {
    id: c.id,
    name: c.name,
    address: c.location,
    rating: c.averageRating,
    pricePerHour: c.pricePerHour,
    hasLED: c.hasLED,
    tags: c.surfaceType ? [c.surfaceType] : [],
  };
}

function filterToParams(filter: string, date?: string): Partial<QueryCourtsParams> {
  switch (filter) {
    case 'available': return date ? { date } : {};
    case 'led': return { hasLED: true };
    case 'cheap': return { maxPrice: 100000 };
    case 'top-rated': return { minRating: 4.5 };
    default: return {};
  }
}

const SKELETON_COUNT = 4;

export default function HomePage() {
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [searchParams, setSearchParams] = useState<Partial<QueryCourtsParams>>({});
  const [page, setPage] = useState(1);

  const filterParams = filterToParams(filter, searchParams.date);
  const queryParams: QueryCourtsParams = { ...searchParams, ...filterParams, page, limit: 10 };

  const { data, isLoading, isError } = useCourts(queryParams);

  const courts = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / (queryParams.limit ?? 10)));

  function handleSearch(params: { location: string; date: string; time: string }) {
    setSearchParams({
      location: params.location || undefined,
      date: params.date || undefined,
    });
    setPage(1);
  }

  function handleFilterChange(value: string) {
    setFilter(value);
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HomeNavbar />
      <HeroSearch onSearch={handleSearch} />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col gap-4">
        {/* Filter chips */}
        <FilterChips active={filter} onChange={handleFilterChange} />

        {/* Two-column layout */}
        <div className="flex gap-6 flex-1">
          {/* Court list */}
          <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
            {isLoading ? (
              Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <div
                  key={i}
                  className="w-full bg-white rounded-xl p-4 flex gap-4 border border-gray-200 animate-pulse"
                >
                  <div className="w-[72px] h-[72px] rounded-lg bg-gray-200 shrink-0" />
                  <div className="flex-1 flex flex-col gap-2 py-1">
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="flex gap-1.5 mt-1">
                      <div className="h-4 bg-gray-200 rounded-full w-14" />
                      <div className="h-4 bg-gray-200 rounded-full w-16" />
                    </div>
                  </div>
                </div>
              ))
            ) : isError ? (
              <div className="text-center py-16 text-red-400 text-sm">
                Không thể tải danh sách sân. Vui lòng thử lại.
              </div>
            ) : courts.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-sm">
                Không tìm thấy sân phù hợp.
              </div>
            ) : (
              <>
                {courts.map((court) => (
                  <CourtCard
                    key={court.id}
                    court={toCourtCard(court)}
                    selected={selectedId === court.id}
                    onClick={() => setSelectedId(court.id === selectedId ? undefined : court.id)}
                  />
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 pt-2 pb-4">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="px-4 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:border-[#0F6E56] hover:text-[#0F6E56] transition-colors"
                    >
                      ← Trước
                    </button>
                    <span className="text-sm text-gray-500">
                      {page} / {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="px-4 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:border-[#0F6E56] hover:text-[#0F6E56] transition-colors"
                    >
                      Tiếp →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Map */}
          <div className="hidden lg:block w-[380px] shrink-0 sticky top-[72px] self-start h-[calc(100vh-200px)]">
            <CourtMap
              courts={courts}
              selectedId={selectedId}
              onSelect={(id) => setSelectedId(id === selectedId ? undefined : id)}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

