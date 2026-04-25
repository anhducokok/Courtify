'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { Star, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import type { ApiCourt } from '@/types/court';

// Restore default Leaflet pin (fix bundler path issue)
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const selectedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41],
});

// Fly to selected court
function FlyToSelected({ courts, selectedId }: { courts: ApiCourt[]; selectedId?: string }) {
  const map = useMap();
  useEffect(() => {
    if (!selectedId) return;
    const court = courts.find((c) => c.id === selectedId);
    if (Number.isFinite(court?.latitude) && Number.isFinite(court?.longitude)) {
      map.flyTo([court!.latitude!, court!.longitude!], 15, { duration: 0.6 });
    }
  }, [selectedId, courts, map]);
  return null;
}

interface CourtMapInnerProps {
  courts: ApiCourt[];
  selectedId?: string;
  onSelect?: (id: string) => void;
}

const HCM_CENTER: [number, number] = [10.7769, 106.7009];

export function CourtMapInner({ courts, selectedId, onSelect }: CourtMapInnerProps) {
  const courtsWithCoords = courts.filter(
    (c) => Number.isFinite(c.latitude) && Number.isFinite(c.longitude),
  );
  const selectedCourt = selectedId ? courts.find((c) => c.id === selectedId) : undefined;

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={HCM_CENTER}
        zoom={12}
        className="w-full h-full rounded-xl"
        scrollWheelZoom={true}
        zoomControl={false}
      >
        {/* CartoDB Voyager — clean Google Maps-like style */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <FlyToSelected courts={courts} selectedId={selectedId} />

        {courtsWithCoords.map((court) => (
          <Marker
            key={court.id}
            position={[court.latitude!, court.longitude!]}
            icon={selectedId === court.id ? selectedIcon : new L.Icon.Default()}
            eventHandlers={{ click: () => onSelect?.(court.id) }}
          />
        ))}
      </MapContainer>

      {/* Minimal card — only shown when a court is selected */}
      {selectedCourt && (
        <div className="absolute bottom-3 left-3 right-3 z-[1000]">
          <Card className="border-0 shadow-md bg-white/95 backdrop-blur-sm">
            <CardContent className="p-3 flex items-center gap-3">
              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{selectedCourt.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-medium text-[#0F6E56]">
                    {selectedCourt.pricePerHour.toLocaleString('vi-VN')}đ/giờ
                  </span>
                  <span className="text-gray-300">·</span>
                  <span className="flex items-center gap-0.5 text-xs text-gray-500">
                    <Star className="size-3 fill-amber-400 stroke-amber-400" />
                    {selectedCourt.averageRating.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/courts/${selectedCourt.id}`}
                  className={buttonVariants({ variant: 'default', size: 'sm', className: 'bg-[#0F6E56] hover:bg-[#0D5E49] text-white text-xs h-7 px-3' })}
                >
                  Xem chi tiết
                </Link>
                <button
                  type="button"
                  onClick={() => onSelect?.(selectedCourt.id)}
                  className="text-gray-300 hover:text-gray-500 transition-colors"
                  aria-label="Đóng"
                >
                  <X className="size-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
