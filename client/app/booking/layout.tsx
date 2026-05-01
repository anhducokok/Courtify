'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { BookingProvider } from '@/components/booking/booking-context';
import { BookingStepper } from '@/components/booking/booking-stepper';

interface BookingLayoutProps {
  children: ReactNode;
}

const STEP_MAP: Record<string, number> = {
  '/booking/info': 2,
  '/booking/payment': 3,
  '/booking/success': 4,
};

export default function BookingLayout({ children }: BookingLayoutProps) {
  const pathname = usePathname();
  const currentStep = STEP_MAP[pathname] ?? 2;

  return (
    <BookingProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Top nav */}
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <span className="text-[#0F6E56] font-extrabold text-xl font-lexend">SmashBook</span>
          <span className="text-xs text-gray-400">Bước {currentStep} / 4</span>
        </div>

        {/* Stepper */}
        <div className="bg-white border-b border-gray-100 px-6 py-4">
          <div className="max-w-2xl mx-auto">
            <BookingStepper currentStep={currentStep} />
          </div>
        </div>

        {/* Content */}
        <main className="flex-1">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">{children}</div>
        </main>
      </div>
    </BookingProvider>
  );
}
