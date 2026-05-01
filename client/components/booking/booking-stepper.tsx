'use client';

import { Check } from 'lucide-react';

interface BookingStepperProps {
  currentStep: number; // 1-indexed (1-4)
}

const STEPS = [
  { number: 1, label: 'Chọn sân' },
  { number: 2, label: 'Thông tin' },
  { number: 3, label: 'Thanh toán' },
  { number: 4, label: 'Xác nhận' },
];

export function BookingStepper({ currentStep }: BookingStepperProps) {
  return (
    <div className="w-full">
      <div className="flex items-center">
        {STEPS.map((step, idx) => {
          const done = step.number < currentStep;
          const active = step.number === currentStep;
          const pending = step.number > currentStep;

          return (
            <div key={step.number} className="flex items-center flex-1 last:flex-none">
              {/* Step node */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    done
                      ? 'bg-[#0F6E56] text-white'
                      : active
                      ? 'bg-[#0F6E56] text-white font-bold'
                      : 'bg-gray-100 text-gray-400 border border-gray-200'
                  }`}
                >
                  {done ? (
                    <Check className="w-4 h-4" strokeWidth={2.5} />
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={`text-xs font-medium mt-1.5 whitespace-nowrap ${
                    active
                      ? 'text-[#0F6E56] font-semibold'
                      : done
                      ? 'text-[#0F6E56]'
                      : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {idx < STEPS.length - 1 && (
                <div className="flex-1 mx-2 mb-5">
                  <div
                    className={`h-0.5 rounded-full transition-colors ${
                      step.number < currentStep ? 'bg-[#0F6E56]' : 'bg-gray-200'
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
