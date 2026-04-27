export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface ApiBooking {
  id: string;
  userId: string;
  fieldId: string;
  timeSlotId: string;
  date: string;
  status: BookingStatus;
  createdAt: string;
  field?: {
    id: string;
    name: string;
    pricePerHour: number;
    courtId: string;
    court?: {
      id: string;
      name: string;
      location: string;
    };
  };
  timeSlot?: {
    id: string;
    startTime: string;
    endTime: string;
  };
}

export interface CreateBookingParams {
  fieldId: string;
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
