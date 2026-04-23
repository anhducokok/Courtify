'use client';

import { Search, MapPin, Calendar, Clock } from 'lucide-react';

interface HeroSearchProps {
  onSearch?: (params: { location: string; date: string; time: string }) => void;
}

export function HeroSearch({ onSearch }: HeroSearchProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    onSearch?.({
      location: data.get('location') as string,
      date: data.get('date') as string,
      time: data.get('time') as string,
    });
  };

  return (
    <section className="bg-[#0F6E56] px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
          Tìm sân cầu lông gần bạn
        </h1>
        <p className="text-[#a7f3d0] text-sm mb-8 font-medium">Đặt sân nhanh · 24/7</p>

        {/* Search card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-3 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center shadow-lg"
        >
          {/* Location */}
          <div className="flex items-center gap-2 flex-1 px-3 py-2 border border-gray-200 rounded-lg">
            <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              name="location"
              type="text"
              placeholder="Thành phố, quận..."
              className="text-sm outline-none w-full placeholder-gray-400"
            />
          </div>

          {/* Date */}
          <div className="flex items-center gap-2 flex-1 px-3 py-2 border border-gray-200 rounded-lg">
            <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              name="date"
              type="date"
              className="text-sm outline-none w-full text-gray-600"
            />
          </div>

          {/* Time */}
          <div className="flex items-center gap-2 flex-1 px-3 py-2 border border-gray-200 rounded-lg">
            <Clock className="w-4 h-4 text-gray-400 shrink-0" />
            <select name="time" className="text-sm outline-none w-full text-gray-600 bg-transparent">
              <option value="">Tất cả giờ</option>
              <option value="morning">Sáng (6:00 - 12:00)</option>
              <option value="afternoon">Chiều (12:00 - 18:00)</option>
              <option value="evening">Tối (18:00 - 22:00)</option>
            </select>
          </div>

          {/* Search button */}
          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-[#84cc16] hover:bg-[#65a30d] text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors shrink-0"
          >
            <Search className="w-4 h-4" />
            Tìm kiếm
          </button>
        </form>
      </div>
    </section>
  );
}
