'use client';

import axios from 'axios';
import { useAuth } from '@/context/auth-context';

/**
 * Returns an axios instance that sends cookies automatically (withCredentials).
 * On 401, tries to refresh once; on second 401, logs out.
 */
export function useApiClient() {
    const { logout, refresh } = useAuth();

    const instance = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080',
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
    });

    instance.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;
            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
                try {
                    await refresh();
                    return instance(originalRequest);
                } catch {
                    await logout();
                }
            }
            return Promise.reject(error);
        },
    );

    return instance;
}
