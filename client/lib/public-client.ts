import axios from 'axios';

// Server + client safe — no next-auth/react imports.
// Used by auth.service.ts which runs on both server (NextAuth callbacks) and client.
export const publicClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});
