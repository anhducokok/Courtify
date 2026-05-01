'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { HomeNavbar } from '@/components/home/navbar';
import { HeroSearch } from '@/components/home/hero-search';
import { FilterChips } from '@/components/home/filter-chips';
import { CourtCard, type Court } from '@/components/home/court-card';
import { CourtMap } from '@/components/home/court-map';
import { Footer } from '@/components/home/footer';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import type { ApiCourt } from '@/types/court';

function getFirst(v: string | string[] | undefined): string | undefined {
  if (!v) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

function getPageRange(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | 'ellipsis')[] = [1];
  if (current > 3) pages.push('ellipsis');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
  if (current < total - 2) pages.push('ellipsis');
  pages.push(total);
  return pages;
}

function useIsDesktop() {
  return useSyncExternalStore(
    (callback) => {
      const mq = window.matchMedia('(min-width: 1024px)');
      mq.addEventListener('change', callback);
      return () => mq.removeEventListener('change', callback);
    },
    () => window.matchMedia('(min-width: 1024px)').matches,
    () => false,
  );
}

function toCourtCard(c: ApiCourt, date?: string): Court {
  const prices = c.fields.map((f) => f.pricePerHour);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const hasLED = c.fields.some((f) => f.features?.includes('LED'));
  const totalFields = c.fields.length;
  const bookedFields = c.fields.filter((f) => f.bookingsCount && f.bookingsCount > 0).length;
  const availableFields = totalFields - bookedFields;

  return {
    id: c.id,
    name: c.name,
    address: c.location,
    rating: c.averageRating,
    minPrice,
    maxPrice,
    hasLED,
    tags: [],
    bookingsCount: bookedFields,
    availableCourts: availableFields,
    totalCourts: totalFields,
    date,
  };
}

export type CourtsPageQuery = {
  location?: string;
  date?: string;
  filter?: string;
  minPrice?: string;
  maxPrice?: string;
  hasLED?: string;
  minRating?: string;
  page?: string;
  limit?: string;
  courtId?: string;
};

export function CourtsPageClient({
  courts,
  total,
  query,
}: {
  courts: ApiCourt[];
  total: number;
  query: CourtsPageQuery;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const isDesktop = useIsDesktop();

  const page = Math.max(1, Number(getFirst(query.page) ?? '1') || 1);
  const limit = Math.max(1, Number(getFirst(query.limit) ?? '5') || 5);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const selectedId = (isDesktop ? sp.get('courtId') ?? undefined : undefined) ?? undefined;

  function pushWith(next: Record<string, string | undefined>, opts?: { scroll?: boolean }) {
    const params = new URLSearchParams(sp.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (!v) params.delete(k);
      else params.set(k, v);
    });
    router.push(`/courts?${params.toString()}`, opts);
  }

  function applyFilter(filter: string) {
    // URL is the source of truth. Navigating triggers server re-fetch.
    if (filter === 'all') {
      pushWith({ filter: undefined, hasLED: undefined, maxPrice: undefined, minRating: undefined, page: '1' });
      return;
    }

    if (filter === 'available') {
      pushWith({ filter, page: '1' });
      return;
    }

    if (filter === 'led') {
      pushWith({ filter, hasLED: 'true', page: '1' });
      return;
    }

    if (filter === 'cheap') {
      pushWith({ filter, maxPrice: '100000', page: '1' });
      return;
    }

    if (filter === 'top-rated') {
      pushWith({ filter, minRating: '4.5', page: '1' });
      return;
    }

    pushWith({ filter, page: '1' });
  }

  function handleSearch(params: { location: string; date: string; time: string }) {
    pushWith(
      {
        location: params.location || undefined,
        date: params.date || undefined,
        page: '1',
      },
      { scroll: true },
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HomeNavbar />
      <HeroSearch onSearch={handleSearch} />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col gap-4">
        <FilterChips active={sp.get('filter') ?? 'all'} onChange={applyFilter} />

        <div className="flex gap-6 flex-1">
          <div className="flex-1 flex flex-col gap-3">
            {courts.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-sm">Không tìm thấy sân phù hợp.</div>
            ) : (
              <>
                {courts.map((court) => (
                  <CourtCard
                    key={court.id}
                    court={toCourtCard(court, getFirst(query.date))}
                    selected={isDesktop && selectedId === court.id}
                    onClick={() =>
                      isDesktop
                        ? pushWith({ courtId: selectedId === court.id ? undefined : court.id }, { scroll: false })
                        : router.push(`/courts/${court.id}`)
                    }
                  />
                ))}

                {totalPages > 1 && (
                  <Pagination className="pt-2 pb-4">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          text="Trước"
                          aria-disabled={page <= 1}
                          className={page <= 1 ? 'pointer-events-none opacity-40' : 'cursor-pointer'}
                          href={`/courts?${new URLSearchParams({ ...Object.fromEntries(sp.entries()), page: String(Math.max(1, page - 1)) }).toString()}`}
                        />
                      </PaginationItem>

                      {getPageRange(page, totalPages).map((item, i) =>
                        item === 'ellipsis' ? (
                          <PaginationItem key={`ellipsis-${i}`}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        ) : (
                          <PaginationItem key={item}>
                            <PaginationLink
                              asChild
                              isActive={item === page}
                              className="cursor-pointer"
                            >
                              <Link
                                href={`/courts?${new URLSearchParams({ ...Object.fromEntries(sp.entries()), page: String(item) }).toString()}`}
                              >
                                {item}
                              </Link>
                            </PaginationLink>
                          </PaginationItem>
                        ),
                      )}

                      <PaginationItem>
                        <PaginationNext
                          text="Tiếp"
                          aria-disabled={page >= totalPages}
                          className={page >= totalPages ? 'pointer-events-none opacity-40' : 'cursor-pointer'}
                          href={`/courts?${new URLSearchParams({ ...Object.fromEntries(sp.entries()), page: String(Math.min(totalPages, page + 1)) }).toString()}`}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </div>

          {isDesktop && (
            <div className="w-[380px] shrink-0 sticky top-[72px] self-start h-[calc(100vh-200px)]">
              <CourtMap
                courts={courts}
                selectedId={selectedId}
                onSelect={(id) =>
                  pushWith({ courtId: selectedId === id ? undefined : id }, { scroll: false })
                }
              />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

