import axios from 'axios';

export const publicClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});
