'use client';

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
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
    isInitialized: boolean;
    login: (email: string, password: string) => Promise<AuthUser>;
    register: (email: string, password: string, name?: string) => Promise<AuthUser>;
    logout: () => Promise<void>;
    refresh: () => Promise<void>;
    revalidateSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);
    const refreshAttemptRef = useRef(false);

    /** Restore session from cookies; try refresh once if access token expired. */
    const syncSession = useCallback(async (silently = true) => {
        try {
            const { data } = await publicClient.get<AuthUser>('/auth/me', {
                withCredentials: true,
            });
            setUser(data);
            return true;
        } catch (err: unknown) {
            const status = (err as { response?: { status?: number } })?.response?.status;

            // Try refresh only once if access token expired (401) and not already tried
            if (status === 401 && !refreshAttemptRef.current) {
                refreshAttemptRef.current = true;
                try {
                    await publicClient.post('/auth/refresh', {}, { withCredentials: true });
                    const { data } = await publicClient.get<AuthUser>('/auth/me', {
                        withCredentials: true,
                    });
                    setUser(data);
                    return true;
                } catch {
                    if (!silently) console.error('Session refresh failed');
                    setUser(null);
                    return false;
                }
            }

            if (!silently) console.error('Session sync failed:', status);
            setUser(null);
            return false;
        } finally {
            setIsLoading(false);
            setIsInitialized(true);
            refreshAttemptRef.current = false;
        }
    }, []);

    const refresh = useCallback(async () => {
        try {
            await publicClient.post('/auth/refresh', {}, { withCredentials: true });
            await syncSession(true);
        } catch {
            setUser(null);
        }
    }, [syncSession]);

    // On mount: try to restore session
    useEffect(() => {
        void syncSession(false);
    }, [syncSession]);

    const revalidateSession = useCallback(async () => {
        setIsLoading(true);
        await syncSession(false);
    }, [syncSession]);

    const login = useCallback(async (email: string, password: string) => {
        const { data } = await publicClient.post<{ user: AuthUser }>(
            '/auth/login',
            { email, password },
            { withCredentials: true },
        );
        setUser(data.user);
        return data.user;
    }, []);

    const register = useCallback(async (email: string, password: string, name?: string) => {
        const { data } = await publicClient.post<{ user: AuthUser }>(
            '/auth/register',
            { email, password, name },
            { withCredentials: true },
        );
        setUser(data.user);
        return data.user;
    }, []);

    const logout = useCallback(async () => {
        try {
            await publicClient.post('/auth/logout', {}, { withCredentials: true });
        } finally {
            setUser(null);
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{ user, isLoading, isInitialized, login, register, logout, refresh, revalidateSession }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
}
