'use client';

interface PieChartDataPoint {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartDataPoint[];
}

export function PieChart({ data }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Calculate angles for pie slices
  let currentAngle = 0;
  const slices = data.map((item) => {
    const sliceAngle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;

    return {
      ...item,
      percentage: ((item.value / total) * 100).toFixed(1),
      startAngle,
      endAngle,
    };
  });

  const radius = 80;
  const centerX = 100;
  const centerY = 100;

  const polarToCartesian = (angle: number) => {
    const radians = ((angle - 90) * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(radians),
      y: centerY + radius * Math.sin(radians),
    };
  };

  const createPath = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(startAngle);
    const end = polarToCartesian(endAngle);
    const isLarge = endAngle - startAngle > 180 ? 1 : 0;

    return `
      M ${centerX} ${centerY}
      L ${start.x} ${start.y}
      A ${radius} ${radius} 0 ${isLarge} 1 ${end.x} ${end.y}
      Z
    `;
  };

  return (
    <div className="flex items-center justify-center gap-8">
      {/* Pie Chart */}
      <svg width="200" height="200" viewBox="0 0 200 200">
        {slices.map((slice, index) => (
          <path
            key={index}
            d={createPath(slice.startAngle, slice.endAngle)}
            fill={slice.color}
            opacity="0.8"
            stroke="white"
            strokeWidth="2"
          />
        ))}
      </svg>

      {/* Legend */}
      <div className="space-y-3">
        {slices.map((slice, index) => (
          <div key={index} className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: slice.color }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {slice.label}
              </p>
              <p className="text-xs text-gray-600">
                {slice.percentage}% ({slice.value})
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
