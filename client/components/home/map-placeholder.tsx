import { MapPin } from 'lucide-react';

interface MapPin {
  id: string;
  label: string;
  x: number; // percent from left
  y: number; // percent from top
}

interface MapPlaceholderProps {
  pins?: MapPin[];
  selectedId?: string;
}

const DEFAULT_PINS: MapPin[] = [
  { id: '1', label: '85k · Smash Center', x: 38, y: 42 },
  { id: '2', label: '120k · Pro Hub', x: 62, y: 68 },
];

export function MapPlaceholder({ pins = DEFAULT_PINS, selectedId }: MapPlaceholderProps) {
  return (
    <div className="relative w-full h-full min-h-[400px] bg-[#e8f0e8] rounded-xl overflow-hidden border border-gray-200">
      {/* Fake map grid lines */}
      <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0F6E56" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Fake roads */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <line x1="0" y1="55%" x2="100%" y2="50%" stroke="#c8d8c8" strokeWidth="8" />
        <line x1="35%" y1="0" x2="40%" y2="100%" stroke="#c8d8c8" strokeWidth="6" />
        <line x1="60%" y1="0" x2="65%" y2="100%" stroke="#c8d8c8" strokeWidth="5" />
        <line x1="0" y1="75%" x2="100%" y2="72%" stroke="#c8d8c8" strokeWidth="4" />
      </svg>

      {/* Pins */}
      {pins.map((pin) => (
        <div
          key={pin.id}
          className="absolute flex flex-col items-center"
          style={{ left: `${pin.x}%`, top: `${pin.y}%`, transform: 'translate(-50%, -100%)' }}
        >
          <div
            className={[
              'text-[11px] font-semibold px-2 py-1 rounded-lg shadow-md whitespace-nowrap mb-1',
              selectedId === pin.id
                ? 'bg-[#0F6E56] text-white'
                : 'bg-white text-gray-700 border border-gray-200',
            ].join(' ')}
          >
            {pin.label}
          </div>
          <MapPin
            className={[
              'w-5 h-5',
              selectedId === pin.id ? 'text-[#0F6E56]' : 'text-gray-500',
            ].join(' ')}
            fill={selectedId === pin.id ? '#0F6E56' : 'white'}
          />
        </div>
      ))}

      {/* Attribution placeholder */}
      <div className="absolute bottom-2 right-2 text-[10px] text-gray-400 bg-white/70 px-1 rounded">
        Map placeholder
      </div>
    </div>
  );
}
