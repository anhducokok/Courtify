'use client';

import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
} from 'lucide-react';

type DateRange = 'week' | 'month' | 'custom';

const REVENUE_DATA = [
  { date: '1/4', revenue: 1200, bookings: 12 },
  { date: '5/4', revenue: 1800, bookings: 18 },
  { date: '10/4', revenue: 1500, bookings: 15 },
  { date: '15/4', revenue: 2200, bookings: 22 },
  { date: '20/4', revenue: 1900, bookings: 19 },
  { date: '25/4', revenue: 2400, bookings: 24 },
  { date: '30/4', revenue: 2100, bookings: 21 },
];

const COURT_REVENUE = [
  { court: 'Sân A1', revenue: 4_200_000 },
  { court: 'Sân A2', revenue: 3_800_000 },
  { court: 'Sân A3', revenue: 3_100_000 },
  { court: 'Sân A4', revenue: 2_900_000 },
  { court: 'Sân A5', revenue: 2_400_000 },
  { court: 'Sân A6', revenue: 2_000_000 },
];

const HEATMAP_HOURS = Array.from({ length: 16 }, (_, i) => i + 6);
const HEATMAP_DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const HEATMAP_DATA: number[][] = [
  [1, 0, 2, 1, 3, 4, 2],
  [2, 1, 3, 2, 4, 5, 3],
  [0, 2, 1, 3, 2, 4, 1],
  [3, 2, 4, 3, 5, 6, 4],
  [4, 3, 5, 4, 6, 7, 5],
  [5, 4, 6, 5, 7, 8, 6],
  [3, 2, 4, 3, 5, 6, 4],
  [2, 1, 3, 2, 4, 5, 3],
  [1, 0, 2, 1, 3, 4, 2],
  [0, 1, 0, 1, 2, 3, 1],
  [1, 2, 1, 2, 3, 4, 2],
  [2, 3, 2, 3, 4, 5, 3],
  [3, 4, 3, 4, 5, 6, 4],
  [4, 5, 4, 5, 6, 7, 5],
  [3, 4, 3, 4, 5, 6, 4],
  [2, 3, 2, 3, 4, 5, 3],
];

const TOP_CUSTOMERS = [
  { rank: 1, name: 'Nguyễn Văn Minh', bookings: 28, spend: 3_600_000, favCourt: 'A1', badge: 'Thân thiết' },
  { rank: 2, name: 'Trần Thị Lan', bookings: 22, spend: 2_800_000, favCourt: 'A2', badge: 'Thân thiết' },
  { rank: 3, name: 'Lê Hoàng Phong', bookings: 18, spend: 2_200_000, favCourt: 'A1', badge: 'Mới' },
  { rank: 4, name: 'Phạm Thị Hương', bookings: 15, spend: 1_900_000, favCourt: 'A3', badge: 'Mới' },
  { rank: 5, name: 'Hoàng Văn Đức', bookings: 12, spend: 1_500_000, favCourt: 'A4', badge: 'Mới' },
];

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN').format(n) + 'đ';

function DonutChart({ value }: { value: number }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <div className="relative w-12 h-12">
      <svg viewBox="0 0 44 44" className="w-full h-full -rotate-90">
        <circle cx="22" cy="22" r={r} fill="none" stroke="#E5E7EB" strokeWidth="5" />
        <circle
          cx="22" cy="22" r={r}
          fill="none"
          stroke="#0F6E56"
          strokeWidth="5"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-gray-800">{value}%</span>
      </div>
    </div>
  );
}

function HeatmapCell({ value, max }: { value: number; max: number }) {
  const ratio = max > 0 ? value / max : 0;
  const bg = ratio > 0.75
    ? 'bg-[#0F6E56] text-white'
    : ratio > 0.5
    ? 'bg-[#85C440] text-white'
    : ratio > 0.25
    ? 'bg-[#D4FF00] text-[#085041]'
    : 'bg-gray-50 text-gray-400';
  return (
    <div className={`w-7 h-7 rounded-sm flex items-center justify-center text-[10px] font-semibold ${bg}`}>
      {value > 0 ? value : ''}
    </div>
  );
}

export default function OwnerRevenuePage() {
  const [range, setRange] = useState<DateRange>('month');
  const maxHeatmap = Math.max(...HEATMAP_DATA.flat());
  const maxRevenue = Math.max(...COURT_REVENUE.map((c) => c.revenue));

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold font-lexend text-[#085041]">Doanh thu</h1>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            <Download className="w-3.5 h-3.5" />
            PDF
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            <Download className="w-3.5 h-3.5" />
            Excel
          </button>
        </div>
      </div>

      {/* Date range */}
      <div className="flex items-center gap-2">
        {([
          { key: 'week', label: 'Tuần này' },
          { key: 'month', label: 'Tháng này' },
          { key: 'custom', label: 'Tùy chỉnh' },
        ] as { key: DateRange; label: string }[]).map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              range === r.key
                ? 'bg-[#0F6E56] text-white'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {r.label}
          </button>
        ))}
        <div className="ml-auto text-sm text-gray-400 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          01/04/2025 – 30/04/2025
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total revenue */}
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">Tổng doanh thu tháng</p>
              <p className="text-2xl font-bold font-lexend text-[#0F6E56]">18.400.000đ</p>
              <div className="flex items-center gap-0.5 mt-1">
                <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                <span className="text-xs font-semibold text-green-600">+8%</span>
                <span className="text-xs text-gray-400">vs tháng trước</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#0F6E56]/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#0F6E56]" />
            </div>
          </div>
        </div>

        {/* Bookings */}
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">Lượt đặt thành công</p>
              <p className="text-2xl font-bold font-lexend text-gray-900">230 lượt</p>
              <div className="flex items-center gap-0.5 mt-1">
                <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                <span className="text-xs font-semibold text-green-600">+15</span>
                <span className="text-xs text-gray-400">vs tháng trước</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#D4FF00]/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#085041]" />
            </div>
          </div>
        </div>

        {/* Fill rate */}
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">Tỉ lệ lấp đầy</p>
              <p className="text-2xl font-bold font-lexend text-gray-900">74%</p>
              <p className="text-xs text-gray-400 mt-1">Trung bình tháng</p>
            </div>
            <DonutChart value={74} />
          </div>
        </div>
      </div>

      {/* Revenue line chart */}
      <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
        <h2 className="text-sm font-bold font-lexend text-gray-800 mb-1">Doanh thu theo ngày</h2>
        <p className="text-xs text-gray-400 mb-4">Doanh thu (đường xanh) &amp; Lượt đặt × 1000đ (đường đứt)</p>
        <div className="relative h-[220px]">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-gray-300 text-right pr-2">
            <span>2.5M</span>
            <span>2.0M</span>
            <span>1.5M</span>
            <span>1.0M</span>
            <span>0.5M</span>
            <span>0</span>
          </div>
          {/* Chart */}
          <div className="ml-14 h-full relative">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="border-t border-gray-100 w-full" />
              ))}
            </div>
            {/* Bars */}
            <div className="absolute inset-0 flex items-end">
              {REVENUE_DATA.map((d, i) => {
                const barH = (d.revenue / 2_500_000) * 100;
                const bookingH = (d.bookings / 25) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col gap-1 items-center justify-end px-1 relative">
                    <div className="w-full bg-[#0F6E56]/10 rounded-t-sm relative" style={{ height: `${bookingH}%` }}>
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-[#0F6E56] rounded-t-sm transition-all"
                        style={{ height: `${(d.revenue / 2_500_000) * 100}%` }}
                      />
                    </div>
                    <div
                      className="absolute w-0.5 bg-[#97C459] rounded-full"
                      style={{ height: `${bookingH}%`, bottom: 0 }}
                    />
                  </div>
                );
              })}
            </div>
            {/* X-axis */}
            <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-400">
              {REVENUE_DATA.map((d, i) => (
                <span key={i}>{d.date}</span>
              ))}
            </div>
          </div>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-4 mt-6 pt-2">
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-3 h-1.5 rounded-sm bg-[#0F6E56]" />
            Doanh thu (triệu đồng)
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-3 h-0.5 rounded-full bg-[#97C459] border-t border-dashed border-[#97C459]" />
            Lượt đặt × 1000đ
          </span>
        </div>
      </div>

      {/* Bottom row: court revenue + heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue by court */}
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
          <h2 className="text-sm font-bold font-lexend text-gray-800 mb-4">Doanh thu theo sân</h2>
          <div className="space-y-3">
            {COURT_REVENUE.map((c) => {
              const pct = maxRevenue > 0 ? (c.revenue / maxRevenue) * 100 : 0;
              return (
                <div key={c.court} className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-600 w-16 flex-shrink-0">{c.court}</span>
                  <div className="flex-1 bg-gray-50 rounded-full h-6 overflow-hidden">
                    <div
                      className="h-full bg-[#0F6E56] rounded-full flex items-center justify-end pr-2 transition-all"
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    >
                      {pct > 25 && (
                        <span className="text-white text-[10px] font-semibold">{fmt(c.revenue)}</span>
                      )}
                    </div>
                  </div>
                  {pct <= 25 && (
                    <span className="text-xs font-semibold text-gray-500">{fmt(c.revenue)}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Heatmap */}
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
          <h2 className="text-sm font-bold font-lexend text-gray-800 mb-3">Giờ cao điểm</h2>
          <div className="overflow-x-auto">
            <div>
              {/* Day headers */}
              <div className="flex gap-1 mb-1">
                <div className="w-8 flex-shrink-0" />
                {HEATMAP_DAYS.map((d) => (
                  <div key={d} className="flex-1 text-center text-[10px] font-semibold text-gray-400">{d}</div>
                ))}
              </div>
              {/* Rows */}
              {HEATMAP_HOURS.map((hour, hi) => (
                <div key={hour} className="flex gap-1 mb-1">
                  <div className="w-8 flex-shrink-0 flex items-center justify-end pr-1.5">
                    <span className="text-[10px] text-gray-300">{hour}:00</span>
                  </div>
                  {HEATMAP_DATA[hi].map((val, di) => (
                    <div key={di} className="flex-1 flex items-center justify-center">
                      <HeatmapCell value={val} max={maxHeatmap} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          {/* Intensity legend */}
          <div className="flex items-center gap-3 mt-3">
            <span className="text-xs text-gray-400">Thấp</span>
            <div className="flex items-center gap-0.5">
              {['bg-gray-50', 'bg-[#D4FF00]', 'bg-[#85C440]', 'bg-[#0F6E56]'].map((c, i) => (
                <div key={i} className={`w-5 h-4 rounded-sm ${c}`} />
              ))}
            </div>
            <span className="text-xs text-gray-400">Cao</span>
          </div>
        </div>
      </div>

      {/* Top customers */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold font-lexend text-gray-800">Top khách hàng</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              {['#', 'Khách hàng', 'Số lần đặt', 'Tổng chi tiêu', 'Sân yêu thích', 'Ghi chú'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {TOP_CUSTOMERS.map((c) => (
              <tr key={c.rank} className="hover:bg-gray-50/30 transition-colors">
                <td className="px-4 py-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    c.rank === 1 ? 'bg-[#D4FF00] text-[#085041]' :
                    c.rank === 2 ? 'bg-gray-200 text-gray-600' :
                    c.rank === 3 ? 'bg-amber-100 text-amber-600' :
                    'bg-gray-50 text-gray-400'
                  }`}>
                    {c.rank}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#0F6E56]/10 flex items-center justify-center text-xs font-bold text-[#0F6E56] flex-shrink-0">
                      {c.name.charAt(0)}
                    </div>
                    <span className="font-semibold text-gray-900 text-sm">{c.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-700">{c.bookings} lần</td>
                <td className="px-4 py-3 text-sm font-semibold text-[#0F6E56]">{fmt(c.spend)}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{c.favCourt}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                    c.badge === 'Thân thiết' ? 'bg-[#0F6E56]/10 text-[#0F6E56]' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {c.badge}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
