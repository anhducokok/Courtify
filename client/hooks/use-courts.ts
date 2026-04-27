'use client';

import { useQuery } from '@tanstack/react-query';
import { courtService } from '@/services/court.service';
import type { QueryCourtsParams } from '@/types/court';

export function useCourts(params: QueryCourtsParams = {}) {
  return useQuery({
    queryKey: ['courts', params],
    queryFn: () => courtService.getCourts(params),
  });
}

export function useCourt(id: string) {
  return useQuery({
    queryKey: ['court', id],
    queryFn: () => courtService.getCourt(id),
    enabled: !!id,
  });
}

export function useCourtAvailability(courtId: string, date: string) {
  return useQuery({
    queryKey: ['court-availability', courtId, date],
    queryFn: () => courtService.getCourtAvailability(courtId, date),
    enabled: !!courtId && !!date,
  });
}
