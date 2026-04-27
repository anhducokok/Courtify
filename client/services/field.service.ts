import { publicClient } from '@/lib/public-client';
import type { ApiTimeSlot } from '@/types/court';

export const fieldService = {
  async getFieldAvailability(fieldId: string, date: string): Promise<ApiTimeSlot[]> {
    const { data } = await publicClient.get<ApiTimeSlot[]>(
      `/fields/${fieldId}/availability`,
      { params: { date } },
    );
    return data;
  },
};

