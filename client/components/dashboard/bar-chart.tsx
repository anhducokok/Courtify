'use client';

interface ChartDataPoint {
  label: string;
  value: number;
}

interface BarChartProps {
  data: ChartDataPoint[];
  maxValue?: number;
}

export function BarChart({ data, maxValue }: BarChartProps) {
  const max = maxValue || Math.max(...data.map((d) => d.value));

  return (
    <div className="flex items-flex-end gap-1 h-[300px] p-4">
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center gap-2">
          {/* Bar */}
          <div className="w-full flex items-end justify-center h-[250px]">
            <div
              className="w-full bg-gradient-to-t from-[#0F6E56] to-[#D4FF00] rounded-t-lg hover:shadow-lg transition-shadow"
              style={{
                height: `${(item.value / max) * 100}%`,
                minHeight: '4px',
              }}
            />
          </div>
          {/* Label */}
          <p className="text-xs text-gray-600 text-center truncate w-full">
            {item.label}
          </p>
          {/* Value */}
          <p className="text-sm font-semibold text-gray-900">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
