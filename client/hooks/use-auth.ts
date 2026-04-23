'use client';

import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import { authService, type RegisterInput } from '@/services/auth.service';

function parseError(err: unknown): Error {
  if (isAxiosError(err)) {
    const msg = err.response?.data?.message;
    const text = Array.isArray(msg) ? msg.join(', ') : (msg ?? err.message);
    return new Error(text);
  }
  if (err instanceof Error) return err;
  return new Error('Something went wrong');
}

export function useLoginMutation() {
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => router.push('/dashboard'),
  });
}

export function useRegisterMutation() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (input: RegisterInput) => {
      try {
        await authService.register(input);
      } catch (err) {
        throw parseError(err);
      }

      const result = await signIn('credentials', {
        email: input.email,
        password: input.password,
        redirect: false,
      });
      if (result?.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => router.push('/dashboard'),
  });
}
