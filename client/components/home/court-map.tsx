import dynamic from 'next/dynamic';
import type { ApiCourt } from '@/types/court';

const CourtMapInner = dynamic(
  () => import('./court-map-inner').then((m) => m.CourtMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[400px] rounded-xl bg-[#e8f0e8] border border-gray-200 flex items-center justify-center">
        <span className="text-sm text-gray-400 animate-pulse">Đang tải bản đồ…</span>
      </div>
    ),
  },
);

interface CourtMapProps {
  courts: ApiCourt[];
  selectedId?: string;
  onSelect?: (id: string) => void;
}

export function CourtMap({ courts, selectedId, onSelect }: CourtMapProps) {
  return (
    <div className="w-full h-full min-h-[400px]">
      <CourtMapInner courts={courts} selectedId={selectedId} onSelect={onSelect} />
    </div>
  );
}
