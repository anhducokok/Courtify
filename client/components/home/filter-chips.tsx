'use client';

const FILTERS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'available', label: 'Còn trống' },
  { value: 'led', label: 'Có đèn LED' },
  { value: 'cheap', label: 'Giá < 100k' },
  { value: 'top-rated', label: 'Đánh giá cao' },
];

interface FilterChipsProps {
  active: string;
  onChange: (value: string) => void;
}

export function FilterChips({ active, onChange }: FilterChipsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {FILTERS.map((filter) => (
        <button
          key={filter.value}
          type="button"
          onClick={() => onChange(filter.value)}
          className={[
            'text-sm px-4 py-1.5 rounded-full border font-medium transition-colors',
            active === filter.value
              ? 'bg-[#0F6E56] text-white border-[#0F6E56]'
              : 'bg-white text-gray-600 border-gray-200 hover:border-[#0F6E56] hover:text-[#0F6E56]',
          ].join(' ')}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
