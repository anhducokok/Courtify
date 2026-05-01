'use client';

import { useQuery, useQueries } from '@tanstack/react-query';
import { fieldService } from '@/services/field.service';

export function useFieldAvailability(fieldId: string | undefined, date: string | undefined) {
  return useQuery({
    queryKey: ['field-availability', fieldId, date],
    queryFn: () => fieldService.getFieldAvailability(fieldId as string, date as string),
    enabled: !!fieldId && !!date,
  });
}

export function useDayFieldAvailabilities(
  fields: { id: string; name: string }[],
  date: string | undefined,
) {
  const results = useQueries({
    queries: fields.map((f) => ({
      queryKey: ['field-availability', f.id, date],
      queryFn: () => fieldService.getFieldAvailability(f.id, date as string),
      enabled: !!f.id && !!date,
    })),
  });

  return {
    data: fields.map((f, i) => ({ field: f, slots: results[i].data ?? [] })),
    isLoading: results.some((r) => r.isLoading),
  };
}

export function useWeekFieldAvailability(
  fieldId: string | undefined,
  weekDays: Date[],
) {
  const dates = weekDays.map((d) => d.toISOString().split('T')[0]);  return useQuery({
    queryKey: ['field-availability-week', fieldId, dates],
    queryFn: async () => {
      const results = await Promise.all(
        dates.map((date) => fieldService.getFieldAvailability(fieldId as string, date)),
      );
      return dates.map((date, i) => ({ date, slots: results[i] }));
    },
    enabled: !!fieldId && weekDays.length === 7,
  });
}