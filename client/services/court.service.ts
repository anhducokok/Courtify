import { publicClient } from '@/lib/public-client';
import type { ApiCourt, ApiTimeSlot, PaginatedResponse, QueryCourtsParams } from '@/types/court';

export const courtService = {
  async getCourts(params: QueryCourtsParams = {}): Promise<PaginatedResponse<ApiCourt>> {
    const { data } = await publicClient.get<PaginatedResponse<ApiCourt>>('/courts', { params });
    return data;
  },

  async getCourt(id: string, date?: string): Promise<ApiCourt> {
    const { data } = await publicClient.get<ApiCourt>(`/courts/${id}`, {
      params: date ? { date } : {},
    });
    return data;
  },

  async getFieldAvailability(fieldId: string, date: string): Promise<ApiTimeSlot[]> {
    const { data } = await publicClient.get<ApiTimeSlot[]>(
      `/fields/${fieldId}/availability`,
      { params: { date } },
    );
    return data;
  },
};
