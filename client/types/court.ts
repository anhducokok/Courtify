export interface ApiField {
  id: string;
  name: string;
  pricePerHour: number;
  features: string[];
  courtId: string;
  bookingsCount?: number;
}

export interface ApiCourt {
  id: string;
  name: string;
  location: string;
  averageRating: number;
  reviewCount: number;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  fields: ApiField[];
}

export interface ApiTimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  status?: 'AVAILABLE' | 'PENDING' | 'CONFIRMED';
}

export interface QueryCourtsParams {
  location?: string;
  date?: string;
  minPrice?: number;
  maxPrice?: number;
  hasLED?: boolean;
  minRating?: number;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
