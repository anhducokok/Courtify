import { apiClient } from '@/lib/api-client';
import type {
  BookingPlansResponse,
  CreatePlanDto,
  FieldBookingPlan,
  ResolvedSlot,
  UpdatePlanDto,
} from '@/types/booking-plan';

export const bookingPlanService = {
  // ── Owner/Manager CRUD ───────────────────────────────────────────────

  async getPlansByField(fieldId: string): Promise<BookingPlansResponse> {
    const { data } = await apiClient.get<BookingPlansResponse>(
      `/fields/${fieldId}/booking-plans`,
    );
    return data;
  },

  async createPlan(
    fieldId: string,
    dto: CreatePlanDto,
  ): Promise<FieldBookingPlan> {
    const { data } = await apiClient.post<FieldBookingPlan>(
      `/fields/${fieldId}/booking-plans`,
      dto,
    );
    return data;
  },

  async updatePlan(
    planId: string,
    dto: UpdatePlanDto,
  ): Promise<FieldBookingPlan> {
    const { data } = await apiClient.patch<FieldBookingPlan>(
      `/fields/booking-plans/${planId}`,
      dto,
    );
    return data;
  },

  async deletePlan(planId: string): Promise<{ message: string }> {
    const { data } = await apiClient.delete<{ message: string }>(
      `/fields/booking-plans/${planId}`,
    );
    return data;
  },

  // ── Public availability ─────────────────────────────────────────────

  async getAvailability(
    fieldId: string,
    date: string,
  ): Promise<ResolvedSlot[]> {
    const { data } = await apiClient.get<ResolvedSlot[]>(
      `/fields/${fieldId}/availability`,
      { params: { date } },
    );
    return data;
  },
};
