import { publicClient } from '@/lib/public-client';

export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  id: string;
}

export const authService = {
  async register(input: RegisterInput): Promise<void> {
    await publicClient.post('/auth/register', input);
  },

  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await publicClient.post<LoginResponse>('/auth/login', { email, password });
    return data;
  },

  // Called server-side only (from NextAuth jwt callback).
  async refresh(refreshToken: string): Promise<Pick<LoginResponse, 'accessToken' | 'refreshToken'>> {
    const { data } = await publicClient.post<LoginResponse>(
      '/auth/refresh',
      {},
      { headers: { Authorization: `Bearer ${refreshToken}` } },
    );
    return { accessToken: data.accessToken, refreshToken: data.refreshToken };
  },
};
