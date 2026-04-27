'use client';

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
import { publicClient } from '@/lib/public-client';

export interface AuthUser {
    id: string;
    email: string;
    name: string | null;
    role: string;
}

interface AuthContextValue {
    user: AuthUser | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name?: string) => Promise<void>;
    logout: () => Promise<void>;
    refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch current user from /auth/me — uses access_token cookie automatically
    const fetchMe = useCallback(async () => {
        try {
            const { data } = await publicClient.get<AuthUser>('/auth/me', {
                withCredentials: true,
            });
            setUser(data);
        } catch {
            setUser(null);
        }
    }, []);

    const refresh = useCallback(async () => {
        try {
            await publicClient.post('/auth/refresh', {}, { withCredentials: true });
            await fetchMe();
        } catch {
            setUser(null);
        }
    }, [fetchMe]);

    // On mount: try to restore session, silently refresh if access token is expired
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const { data } = await publicClient.get<AuthUser>('/auth/me', {
                    withCredentials: true,
                });
                if (!cancelled) setUser(data);
            } catch (err: any) {
                if (err?.response?.status === 401) {
                    // Try to refresh
                    try {
                        await publicClient.post('/auth/refresh', {}, { withCredentials: true });
                        const { data } = await publicClient.get<AuthUser>('/auth/me', {
                            withCredentials: true,
                        });
                        if (!cancelled) setUser(data);
                    } catch {
                        if (!cancelled) setUser(null);
                    }
                } else {
                    if (!cancelled) setUser(null);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const { data } = await publicClient.post<{ user: AuthUser }>(
            '/auth/login',
            { email, password },
            { withCredentials: true },
        );
        setUser(data.user);
    }, []);

    const register = useCallback(async (email: string, password: string, name?: string) => {
        const { data } = await publicClient.post<{ user: AuthUser }>(
            '/auth/register',
            { email, password, name },
            { withCredentials: true },
        );
        setUser(data.user);
    }, []);

    const logout = useCallback(async () => {
        try {
            await publicClient.post('/auth/logout', {}, { withCredentials: true });
        } finally {
            setUser(null);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout, refresh }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
}
