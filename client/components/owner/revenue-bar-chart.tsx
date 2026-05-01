'use client';

interface RevenueBarChartProps {
  data: {
    label: string;
    morning: number;
    afternoon: number;
    evening: number;
  }[];
  maxValue?: number;
}

export function RevenueBarChart({ data, maxValue }: RevenueBarChartProps) {
  const max = maxValue || Math.max(...data.flatMap((d) => [d.morning, d.afternoon, d.evening]));

  const fmt = (v: number) =>
    v >= 1000 ? `${Math.round(v / 1000)}k` : String(v);

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[480px]">
        {/* Legend */}
        <div className="flex items-center gap-4 mb-3">
          {[
            { label: 'Sáng (6–12h)', color: '#D4FF00' },
            { label: 'Chiều (12–17h)', color: '#85C440' },
            { label: 'Tối (17–22h)', color: '#0F6E56' },
          ].map((l) => (
            <span key={l.label} className="flex items-center gap-1.5 text-xs text-gray-500">
              <span
                className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                style={{ background: l.color }}
              />
              {l.label}
            </span>
          ))}
        </div>

        {/* Bars */}
        <div className="flex items-end gap-3 h-[180px]">
          {data.map((day) => {
            const total = day.morning + day.afternoon + day.evening;
            const totalH = max > 0 ? (total / max) * 100 : 0;
            return (
              <div key={day.label} className="flex-1 flex flex-col items-center gap-2">
                <p className="text-xs text-gray-400 font-medium">{fmt(total)}k</p>
                <div className="w-full flex flex-col-reverse gap-px rounded-sm overflow-hidden" style={{ height: '140px' }}>
                  <div
                    className="w-full bg-[#0F6E56] transition-all"
                    style={{ height: max > 0 ? `${(day.evening / max) * 140}px` : '4px', minHeight: '4px' }}
                  />
                  <div
                    className="w-full bg-[#85C440] transition-all"
                    style={{ height: max > 0 ? `${(day.afternoon / max) * 140}px` : '4px', minHeight: '4px' }}
                  />
                  <div
                    className="w-full bg-[#D4FF00] transition-all"
                    style={{ height: max > 0 ? `${(day.morning / max) * 140}px` : '4px', minHeight: '4px' }}
                  />
                </div>
                <p className="text-xs text-gray-600 font-semibold">{day.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
