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

export function useLoginMutation() {
  const router = useRouter();
  const { login } = useAuth();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      try {
        await login(email, password);
      } catch (err) {
        throw parseError(err);
      }
    },
    onSuccess: () => router.push("/courts"),
  });
}

export function useRegisterMutation() {
  const router = useRouter();
  const { register } = useAuth();

  return useMutation({
    mutationFn: async (input: { email: string; password: string; name?: string }) => {
      try {
        await register(input.email, input.password, input.name);
      } catch (err) {
        throw parseError(err);
      }
    },
    onSuccess: () => router.push("/courts"),
  });
}
