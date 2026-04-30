'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingPlanService } from '@/services/booking-plan.service';
import type { CreatePlanDto, UpdatePlanDto } from '@/types/booking-plan';

// ── Query keys ─────────────────────────────────────────────────────────

export const bookingPlanKeys = {
  all: ['bookingPlans'] as const,
  byField: (fieldId: string) => [...bookingPlanKeys.all, 'field', fieldId] as const,
  availability: (fieldId: string, date: string) =>
    [...bookingPlanKeys.all, 'availability', fieldId, date] as const,
};

// ── Queries ───────────────────────────────────────────────────────────

export function useBookingPlans(fieldId: string) {
  return useQuery({
    queryKey: bookingPlanKeys.byField(fieldId),
    queryFn: () => bookingPlanService.getPlansByField(fieldId),
    enabled: !!fieldId,
  });
}

export function useAvailability(fieldId: string | undefined, date: string | undefined) {
  return useQuery({
    queryKey: bookingPlanKeys.availability(fieldId ?? '', date ?? ''),
    queryFn: () => bookingPlanService.getAvailability(fieldId!, date!),
    enabled: !!fieldId && !!date,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────

export function useCreatePlan(fieldId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreatePlanDto) =>
      bookingPlanService.createPlan(fieldId, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bookingPlanKeys.byField(fieldId) });
    },
  });
}

export function useUpdatePlan(fieldId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, dto }: { planId: string; dto: UpdatePlanDto }) =>
      bookingPlanService.updatePlan(planId, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bookingPlanKeys.byField(fieldId) });
    },
  });
}

export function useDeletePlan(fieldId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (planId: string) => bookingPlanService.deletePlan(planId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bookingPlanKeys.byField(fieldId) });
    },
  });
}
