'use client';

interface TimeSlot {
  time: string;
  courtA1?: { name: string; phone?: string };
  courtA2?: { name: string; phone?: string };
  courtA3?: { name: string; phone?: string };
  courtA4?: { name: string; phone?: string };
  courtA5?: { name: string; phone?: string };
  courtA6?: { name: string; phone?: string };
}

interface BookingTimelineProps {
  slots: TimeSlot[];
  showDate?: string;
}

const COURTS = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'] as const;

const EMPTY_BOOKING = null;

export function BookingTimeline({ slots }: BookingTimelineProps) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        {/* Header Row */}
        <div className="flex">
          <div className="w-14 flex-shrink-0" />
          {COURTS.map((c) => (
            <div
              key={c}
              className="flex-1 px-1 py-2 text-center text-xs font-semibold text-[#085041] border-b border-gray-100"
            >
              Sân {c}
            </div>
          ))}
        </div>

        {/* Time Rows */}
        {slots.map((slot) => (
          <div key={slot.time} className="flex items-stretch border-b border-gray-50 last:border-0 min-h-[40px]">
            {/* Time label */}
            <div className="w-14 flex-shrink-0 flex items-center justify-end pr-2">
              <span className="text-xs text-gray-400 font-medium whitespace-nowrap">{slot.time}</span>
            </div>

            {/* Court cells */}
            {COURTS.map((c) => {
              const key = `court${c}` as keyof TimeSlot;
              const booking = slot[key] as TimeSlot['courtA1'];
              return (
                <div key={c} className="flex-1 px-0.5 py-0.5 relative group">
                  {booking ? (
                    <div className="h-full rounded-md bg-[#0F6E56] px-2 py-1 flex flex-col justify-center min-h-[36px]">
                      <p className="text-white text-xs font-semibold leading-tight truncate">
                        {booking.name}
                      </p>
                      {booking.phone && (
                        <p className="text-white/60 text-[10px] leading-tight truncate">
                          {booking.phone}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="h-full rounded-md bg-gray-50 border border-dashed border-gray-200 min-h-[36px]" />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
