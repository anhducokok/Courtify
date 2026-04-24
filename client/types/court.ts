export interface ApiCourt {
  id: string;
  name: string;
  location: string;
  pricePerHour: number;
  hasLED: boolean;
  surfaceType: string | null;
  averageRating: number;
  reviewCount: number;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
}

export interface ApiTimeSlot {
  id: string;
  startTime: string;
  endTime: string;
}

export interface QueryCourtsParams {
  location?: string;
  date?: string;
  minPrice?: number;
  maxPrice?: number;
  hasLED?: boolean;
  surfaceType?: string;
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
