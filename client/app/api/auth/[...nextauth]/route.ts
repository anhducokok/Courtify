import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { NextRequest } from 'next/server';
import { authService } from '@/services/auth.service';

const ACCESS_TOKEN_TTL_MS = 14 * 60 * 1000; // 14 min (1 min before 15 min expiry)

async function refreshAccessToken(refreshToken: string) {
  try {
    const tokens = await authService.refresh(refreshToken);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      accessTokenExpires: Date.now() + ACCESS_TOKEN_TTL_MS,
      error: undefined,
    };
  } catch {
    return { error: 'RefreshAccessTokenError' as const };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }
        try {
          const data = await authService.login(credentials.email, credentials.password);
          return {
            id: data.id,
            email: credentials.email,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          };
        } catch (error: unknown) {
          const err = error as { response?: { data?: { message?: string } } };
          throw new Error(err?.response?.data?.message || 'Invalid credentials');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign-in: seed token fields from the user object returned by authorize().
      if (user) {
        return {
          ...token,
          id: user.id,
          accessToken: user.accessToken,
          // refreshToken lives ONLY here — never leaves the server-side JWT cookie.
          refreshToken: user.refreshToken,
          accessTokenExpires: Date.now() + ACCESS_TOKEN_TTL_MS,
        };
      }

      // Token still valid — pass through unchanged.
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Access token expired — refresh silently using the stored refreshToken.
      const refreshed = await refreshAccessToken(token.refreshToken as string);
      return { ...token, ...refreshed };
    },

    async session({ session, token }) {
      // Only expose what the client actually needs.
      // refreshToken is intentionally NOT included here.
      session.accessToken = token.accessToken as string;
      session.error = token.error as string | undefined;
      session.user = { ...session.user, id: token.id as string, email: token.email as string };
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
};

const handler = NextAuth(authOptions);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ nextauth: string[] }> },
) {
  return handler(request, { params: await params });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ nextauth: string[] }> },
) {
  return handler(request, { params: await params });
}
