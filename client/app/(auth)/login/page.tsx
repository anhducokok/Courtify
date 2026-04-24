'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import Image from 'next/image';
import { useLoginMutation } from '@/hooks/use-auth';
import tienMinhImg from '@/assets/tienminh.webp';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { mutate: login, isPending, error } = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <div className="flex min-h-screen">
      {/* ── Left Panel ── */}
      <div className="relative hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col">
        {/* Background image */}
        <Image
          src={tienMinhImg}
          alt="Badminton player in action"
          fill
          className="object-cover object-center"
          quality={100}
          sizes="(min-width: 1024px) 60vw, 100vw"
          priority
        />

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a3a1a]/85 via-[#1e4d2b]/70 to-black/50" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-12 text-white">
          {/* Logo */}
          <div>
            <span className="text-2xl font-extrabold tracking-tight text-[#c8f04a]">
              Courtify            </span>
          </div>

          {/* Hero text + stats */}
          <div className="max-w-lg">
            <h1 className="text-5xl font-extrabold leading-tight mb-4 drop-shadow-lg">
              Precision in Every Booking.
            </h1>
            <p className="text-lg text-white/80 mb-12 leading-relaxed">
              Join the premier community for competitive and social badminton.
              Secure your court in seconds.
            </p>

            <div className="flex gap-16">
              <div>
                <div className="text-4xl font-extrabold text-[#c8f04a]">1,200+</div>
                <div className="text-xs font-semibold uppercase tracking-widest text-white/60 mt-1">
                  Courts Available
                </div>
              </div>
              <div>
                <div className="text-4xl font-extrabold text-[#c8f04a]">45k+</div>
                <div className="text-xs font-semibold uppercase tracking-widest text-white/60 mt-1">
                  Active Players
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex flex-1 items-center justify-center bg-white px-8 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo (hidden on lg+) */}
          <div className="mb-8 lg:hidden text-center">
            <span className="text-2xl font-extrabold text-[#2d6a4f]">Courtify</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
            <p className="mt-1 text-sm text-gray-500">
              Sign in to SmashBook to continue your game.
            </p>
          </div>

          {/* Server error */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <span className="mt-0.5 text-red-500">⚠</span>
              <p className="text-sm text-red-700">{error.message}</p>
            </div>
          )}

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit((data) => login(data))}>
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                Email Address
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                className={`block w-full rounded-lg border px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-[#2d6a4f]/40 ${errors.email
                  ? 'border-red-400 bg-red-50 focus:border-red-400'
                  : 'border-gray-300 bg-white focus:border-[#2d6a4f]'
                  }`}
              />
              {errors.email && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
                  <span>▲</span> {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-[#2d6a4f] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`block w-full rounded-lg border px-4 py-3 pr-12 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-[#2d6a4f]/40 ${errors.password
                    ? 'border-red-400 bg-red-50 focus:border-red-400'
                    : 'border-gray-300 bg-white focus:border-[#2d6a4f]'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
                  <span>▲</span> {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 accent-[#2d6a4f]"
              />
              <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                Remember me
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="mt-2 flex w-full items-center justify-center rounded-lg bg-[#c8f04a] px-4 py-3 text-sm font-bold text-[#1a3a1a] shadow transition hover:bg-[#b8e03a] focus:outline-none focus:ring-2 focus:ring-[#c8f04a]/60 disabled:opacity-60"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in…
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 border-t border-gray-200" />
            <span className="text-xs text-gray-400 font-medium">OR SIGN IN WITH</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          {/* Social buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </button>
          </div>

          {/* Register link */}
          <p className="mt-8 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-[#2d6a4f] hover:underline">
              Sign up now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
