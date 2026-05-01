import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name?: string;
    accessToken?: string;
    refreshToken?: string; // only used internally by authorize() → jwt callback
  }

  interface Session {
    user?: User;
    accessToken?: string;
    // refreshToken is intentionally absent — it never leaves the server-side cookie
    error?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    accessToken?: string;
    refreshToken?: string; // stored in encrypted JWT cookie only
    accessTokenExpires?: number; // ms timestamp
    error?: string;
  }
}

