'use client';

import { useState } from 'react';
import { useBookings, useCancelBooking } from '@/hooks/use-bookings';
import { BookingCard } from '@/components/my-bookings/booking-card';
import { BookingStatus } from '@/types/booking';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const PAGE_SIZE = 8;
const SKELETON_COUNT = 4;

type FilterOption = BookingStatus | 'ALL';

const tabs: { label: string; value: FilterOption }[] = [
  { label: 'Tất cả', value: 'ALL' },
  { label: 'Chờ xác nhận', value: 'PENDING' },
  { label: 'Đã xác nhận', value: 'CONFIRMED' },
  { label: 'Đã huỷ', value: 'CANCELLED' },
];

function getPageRange(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | 'ellipsis')[] = [1];
  if (current > 3) pages.push('ellipsis');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i);
  }
  if (current < total - 2) pages.push('ellipsis');
  pages.push(total);
  return pages;
}

export function MyBookingsClient() {
  const [filter, setFilter] = useState<FilterOption>('ALL');
  const [page, setPage] = useState(1);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const queryParams = {
    page,
    limit: PAGE_SIZE,
    ...(filter !== 'ALL' ? { status: filter as BookingStatus } : {}),
  };

  const { data, isLoading, isError } = useBookings(queryParams);
  const cancelMutation = useCancelBooking();

  const bookings = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleFilterChange = (value: FilterOption) => {
    setFilter(value);
    setPage(1);
  };

  const handleCancel = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn huỷ lịch này không?')) {
      setCancelingId(id);
      try {
        await cancelMutation.mutateAsync(id);
      } catch (err) {
        alert('Huỷ lịch thất bại. Vui lòng thử lại sau.');
      } finally {
        setCancelingId(null);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Sân Đã Đặt</h1>

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto pb-4 mb-6 gap-2 no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleFilterChange(tab.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === tab.value
                ? 'bg-[#0F6E56] text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex flex-col gap-4 min-h-[400px]">
        {isLoading ? (
          Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 flex gap-4 animate-pulse">
              <div className="w-20 h-20 bg-gray-200 rounded-lg shrink-0 hidden sm:block" />
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))
        ) : isError ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100 text-red-500">
            Có lỗi xảy ra khi tải danh sách. Vui lòng thử lại sau.
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">📅</span>
            </div>
            <p className="text-gray-500">Bạn chưa có lịch đặt nào.</p>
          </div>
        ) : (
          bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={handleCancel}
              isCanceling={cancelingId === booking.id || cancelMutation.isPending}
            />
          ))
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  text="Trước"
                  onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)); }}
                  aria-disabled={page <= 1}
                  className={page <= 1 ? 'pointer-events-none opacity-40' : 'cursor-pointer'}
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
                      isActive={item === page}
                      onClick={(e) => { e.preventDefault(); setPage(item as number); }}
                      className="cursor-pointer"
                    >
                      {item}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}

              <PaginationItem>
                <PaginationNext
                  text="Tiếp"
                  onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(totalPages, p + 1)); }}
                  aria-disabled={page >= totalPages}
                  className={page >= totalPages ? 'pointer-events-none opacity-40' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}
