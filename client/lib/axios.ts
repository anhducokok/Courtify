'use client';

import axios from 'axios';
import { signOut, useSession } from 'next-auth/react';
import { useMemo } from 'react';

/**
 * Returns an axios instance with the current user's Bearer token pre-attached.
 * Reads from useSession() (React context, zero network calls) instead of
 * getSession() which hits /api/auth/session on every request.
 *
 * Usage: const api = useApiClient();
 *        const data = await api.get('/courts');
 */
export function useApiClient() {
  const { data: session } = useSession();

  return useMemo(() => {
    const instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
      headers: { 'Content-Type': 'application/json' },
    });

    instance.interceptors.request.use((config) => {
      if (session?.error === 'RefreshAccessTokenError') {
        signOut({ redirect: true, callbackUrl: '/login' });
        return Promise.reject(new Error('Session expired'));
      }
      if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`;
      }
      return config;
    });

    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          signOut({ redirect: true, callbackUrl: '/login' });
        }
        return Promise.reject(error);
      },
    );

    return instance;
  }, [session]);
}
