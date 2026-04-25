export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface ApiBooking {
  id: string;
  userId: string;
  courtId: string;
  timeSlotId: string;
  date: string;
  status: BookingStatus;
  createdAt: string;
  court?: {
    id: string;
    name: string;
    location: string;
    pricePerHour: number;
  };
  timeSlot?: {
    id: string;
    startTime: string;
    endTime: string;
  };
}

export interface CreateBookingParams {
  courtId: string;
  timeSlotId: string;
  date: string;
}

export interface QueryBookingsParams {
  status?: BookingStatus;
  page?: number;
  limit?: number;
}

export interface PaginatedBookings {
  data: ApiBooking[];
  total: number;
  page: number;
  limit: number;
}
