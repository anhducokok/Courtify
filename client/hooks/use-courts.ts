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

export function useCourt(id: string, date?: string) {
  return useQuery({
    queryKey: ['court', id, date],
    queryFn: () => courtService.getCourt(id, date),
    enabled: !!id,
  });
}

export function useFieldAvailability(fieldId: string | undefined | null, date: string | undefined | null) {
  return useQuery({
    queryKey: ['field-availability', fieldId, date],
    queryFn: () => courtService.getFieldAvailability(fieldId!, date!),
    enabled: !!fieldId && !!date,
  });
}
