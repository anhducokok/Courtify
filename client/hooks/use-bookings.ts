'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/lib/axios';
import { bookingService } from '@/services/booking.service';
import type { CreateBookingParams, QueryBookingsParams } from '@/types/booking';

export function useCreateBooking() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateBookingParams) => bookingService.createBooking(api, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['court-availability'] });
    },
  });
}

export function useBookings(query: QueryBookingsParams = {}) {
  const api = useApiClient();

  return useQuery({
    queryKey: ['bookings', query],
    queryFn: () => bookingService.getBookings(api, query),
  });
}

export function useCancelBooking() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bookingService.cancelBooking(api, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
