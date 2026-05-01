'use client';

interface LineChartDataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: LineChartDataPoint[];
  maxValue?: number;
  color?: 'green' | 'lime' | 'blue';
}

const colorMap = {
  green: '#0F6E56',
  lime: '#D4FF00',
  blue: '#3B82F6',
};

export function LineChart({ data, maxValue, color = 'green' }: LineChartProps) {
  const max = maxValue || Math.max(...data.map((d) => d.value));
  const chartColor = colorMap[color];

  // Calculate points for the path
  const points = data.map((item, index) => ({
    x: (index / (data.length - 1)) * 100,
    y: 100 - (item.value / max) * 100,
  }));

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="w-full h-[300px] p-4 flex flex-col">
      {/* SVG Chart */}
      <svg
        className="w-full flex-1"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Grid lines */}
        <g stroke="#E5E7EB" strokeWidth="0.5">
          {[0, 25, 50, 75, 100].map((y) => (
            <line key={y} x1="0" y1={y} x2="100" y2={y} />
          ))}
        </g>

        {/* Line */}
        <path
          d={pathData}
          stroke={chartColor}
          strokeWidth="2"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />

        {/* Area under the line */}
        <path
          d={`${pathData} L 100 100 L 0 100 Z`}
          fill={chartColor}
          opacity="0.1"
        />

        {/* Dots */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="2"
            fill={chartColor}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      {/* Labels */}
      <div className="flex justify-between mt-4 text-xs text-gray-600">
        {data.map((item, index) => (
          <div key={index} className="text-center flex-1">
            <p>{item.label}</p>
            <p className="font-semibold text-gray-900 mt-1">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
