'use client';

import axios from 'axios';
import { publicClient } from './public-client';

/**
 * Authenticated axios instance with automatic token refresh on 401.
 * Uses the same base URL and cookie-based auth as the app.
 */
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await publicClient.post('/auth/refresh', {}, { withCredentials: true });
        return apiClient(originalRequest);
      } catch {
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  },
);

// ── Court types ─────────────────────────────────────────────────────

export type CourtStatus = 'PENDING_APPROVAL' | 'ACTIVE' | 'INACTIVE';

export interface CourtOwner {
  id: string;
  name: string | null;
  email: string;
}

export interface CourtField {
  id: string;
  name: string;
  pricePerHour: number;
}

export interface Court {
  id: string;
  name: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  status: CourtStatus;
  averageRating: number;
  reviewCount: number;
  ownerId: string | null;
  owner?: CourtOwner;
  _count?: { fields: number };
  fields?: CourtField[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourtInput {
  name: string;
  location: string;
  latitude?: number;
  longitude?: number;
}

// ── Court API functions ─────────────────────────────────────────────

export async function getMyCourts(): Promise<Court[]> {
  const { data } = await apiClient.get<Court[]>('/courts/my');
  return data;
}

export async function createCourt(input: CreateCourtInput): Promise<Court> {
  const { data } = await apiClient.post<Court>('/courts', input);
  return data;
}

export async function getPendingCourts(): Promise<Court[]> {
  const { data } = await apiClient.get<Court[]>('/courts/pending');
  return data;
}

export async function updateCourtStatus(
  courtId: string,
  status: CourtStatus,
): Promise<Court> {
  const { data } = await apiClient.patch<Court>(`/courts/${courtId}/status`, {
    status,
  });
  return data;
}
