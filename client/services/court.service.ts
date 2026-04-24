import { publicClient } from '@/lib/public-client';
import type { ApiCourt, ApiTimeSlot, PaginatedResponse, QueryCourtsParams } from '@/types/court';

export const courtService = {
  async getCourts(params: QueryCourtsParams = {}): Promise<PaginatedResponse<ApiCourt>> {
    const { data } = await publicClient.get<PaginatedResponse<ApiCourt>>('/courts', { params });
    return data;
  },

  async getCourt(id: string): Promise<ApiCourt> {
    const { data } = await publicClient.get<ApiCourt>(`/courts/${id}`);
    return data;
  },

  async getCourtAvailability(courtId: string, date: string): Promise<ApiTimeSlot[]> {
    const { data } = await publicClient.get<ApiTimeSlot[]>(
      `/courts/${courtId}/availability`,
      { params: { date } },
    );
    return data;
  },
};
