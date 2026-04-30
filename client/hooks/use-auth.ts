"use client";

import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

function parseError(err: unknown): Error {
  if (isAxiosError(err)) {
    const msg = err.response?.data?.message;
    const text = Array.isArray(msg) ? msg.join(", ") : (msg ?? err.message);
    return new Error(text);
  }
  if (err instanceof Error) return err;
  return new Error("Something went wrong");
}

function getRedirectPath(role: string | undefined): string {
  switch (role) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'OWNER':
      return '/manager/dashboard';
    case 'USER':
    default:
      return '/courts';
  }
}

export function useLoginMutation() {
  const router = useRouter();
  const { login } = useAuth();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      try {
        const result = await login(email, password);
        return result;
      } catch (err) {
        throw parseError(err);
      }
    },
    onSuccess: (user) => router.push(getRedirectPath(user?.role)),
  });
}

export function useRegisterMutation() {
  const router = useRouter();
  const { register } = useAuth();

  return useMutation({
    mutationFn: async (input: { email: string; password: string; name?: string }) => {
      try {
        const result = await register(input.email, input.password, input.name);
        return result;
      } catch (err) {
        throw parseError(err);
      }
    },
    onSuccess: (user) => router.push(getRedirectPath(user?.role)),
  });
}
