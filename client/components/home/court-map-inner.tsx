'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { ApiCourt } from '@/types/court';

// Fix Leaflet default icon paths broken by bundlers
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
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Fly to selected court
function FlyToSelected({ courts, selectedId }: { courts: ApiCourt[]; selectedId?: string }) {
  const map = useMap();
  useEffect(() => {
    if (!selectedId) return;
    const court = courts.find((c) => c.id === selectedId);
    if (court?.latitude && court?.longitude) {
      map.flyTo([court.latitude, court.longitude], 15, { duration: 0.8 });
    }
  }, [selectedId, courts, map]);
  return null;
}

interface CourtMapInnerProps {
  courts: ApiCourt[];
  selectedId?: string;
  onSelect?: (id: string) => void;
}

// Ho Chi Minh City center
const HCM_CENTER: [number, number] = [10.7769, 106.7009];

export function CourtMapInner({ courts, selectedId, onSelect }: CourtMapInnerProps) {
  const courtsWithCoords = courts.filter((c) => c.latitude && c.longitude);

  return (
    <MapContainer
      center={HCM_CENTER}
      zoom={12}
      className="w-full h-full rounded-xl"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FlyToSelected courts={courts} selectedId={selectedId} />

      {courtsWithCoords.map((court) => (
        <Marker
          key={court.id}
          position={[court.latitude!, court.longitude!]}
          icon={selectedId === court.id ? selectedIcon : defaultIcon}
          eventHandlers={{ click: () => onSelect?.(court.id) }}
        >
          <Popup minWidth={180}>
            <div className="text-sm">
              <p className="font-bold text-[#0F6E56] leading-snug">{court.name}</p>
              <p className="text-gray-500 text-xs mt-0.5">{court.location}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[#0F6E56] font-semibold">
                  {court.pricePerHour.toLocaleString('vi-VN')}đ/giờ
                </span>
                <span className="text-amber-500 text-xs font-medium">
                  ★ {court.averageRating.toFixed(1)}
                </span>
              </div>
              {court.hasLED && (
                <span className="inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  Đèn LED
                </span>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
