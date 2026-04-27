'use client';

import { useQuery } from '@tanstack/react-query';
import { fieldService } from '@/services/field.service';

export function useFieldAvailability(fieldId: string | undefined, date: string | undefined) {
  return useQuery({
    queryKey: ['field-availability', fieldId, date],
    queryFn: () => fieldService.getFieldAvailability(fieldId as string, date as string),
    enabled: !!fieldId && !!date,
  });
}

