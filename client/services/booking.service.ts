import type { AxiosInstance } from 'axios';
import type {
  ApiBooking,
  CreateBookingParams,
  PaginatedBookings,
  QueryBookingsParams,
} from '@/types/booking';

export const bookingService = {
  async createBooking(api: AxiosInstance, params: CreateBookingParams): Promise<ApiBooking> {
    const { data } = await api.post<ApiBooking>('/bookings', params);
    return data;
  },

  async getBookings(
    api: AxiosInstance,
    query: QueryBookingsParams = {},
  ): Promise<PaginatedBookings> {
    const { data } = await api.get<PaginatedBookings>('/bookings', { params: query });
    return data;
  },

  async getBooking(api: AxiosInstance, id: string): Promise<ApiBooking> {
    const { data } = await api.get<ApiBooking>(`/bookings/${id}`);
    return data;
  },

  async cancelBooking(api: AxiosInstance, id: string): Promise<ApiBooking> {
    const { data } = await api.patch<ApiBooking>(`/bookings/${id}/cancel`);
    return data;
  },

  async confirmBooking(api: AxiosInstance, id: string): Promise<ApiBooking> {
    const { data } = await api.patch<ApiBooking>(`/bookings/${id}/confirm`);
    return data;
  },
};
