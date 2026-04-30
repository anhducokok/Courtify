'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, ChevronRight, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface ApiField {
  id: string;
  name: string;
  pricePerHour: number;
}

interface ApiCourt {
  id: string;
  name: string;
  location: string;
  fields: ApiField[];
}

export function FieldSelector() {
  const router = useRouter();
  const [courts, setCourts] = useState<ApiCourt[]>([]);
  const [selectedCourt, setSelectedCourt] = useState<ApiCourt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch courts on mount
  useEffect(() => {
    async function fetchCourts() {
      try {
        setLoading(true);
        const res = await apiClient.get<ApiCourt[]>('/courts/my', {
          params: { page: 1, limit: 50 },
        });
        setCourts(res.data);
      } catch {
        setError('Không thể tải danh sách cơ sở. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    }
    fetchCourts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFieldSelect = (fieldId: string) => {
    router.push(`/manager/booking-plans/${fieldId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#0F6E56]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-700">
        {error}
      </div>
    );
  }

  if (courts.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
        <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Chưa có cơ sở nào
        </h3>
        <p className="text-gray-500">
          Bạn chưa sở hữu cơ sở nào. Hãy tạo cơ sở để bắt đầu quản lý lịch sân.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Chọn cơ sở &amp; sân để quản lý
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Chọn một sân để thiết lập lịch hoạt động và giá đặc biệt
          </p>
        </div>

        <div className="divide-y divide-gray-100">
          {courts.map((court) => (
            <div key={court.id}>
              {/* Court header */}
              <div
                className="flex items-center gap-3 px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() =>
                  setSelectedCourt(
                    selectedCourt?.id === court.id ? null : court,
                  )
                }
              >
                <div className="w-10 h-10 rounded-xl bg-[#0F6E56]/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-[#0F6E56]" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{court.name}</p>
                  <p className="text-xs text-gray-500">{court.location}</p>
                </div>
                <ChevronRight
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    selectedCourt?.id === court.id ? 'rotate-90' : ''
                  }`}
                />
              </div>

              {/* Field list */}
              {selectedCourt?.id === court.id && (
                <div className="bg-gray-50 px-6 pb-4 space-y-2">
                  {court.fields.length === 0 ? (
                    <p className="text-sm text-gray-400 py-2">
                      Cơ sở này chưa có sân nào.
                    </p>
                  ) : (
                    court.fields.map((field) => (
                      <button
                        key={field.id}
                        onClick={() => handleFieldSelect(field.id)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-200 hover:border-[#0F6E56] hover:shadow-sm transition-all group"
                      >
                        <div className="text-left">
                          <p className="font-medium text-gray-800 group-hover:text-[#0F6E56]">
                            {field.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Giá mặc định:{' '}
                            {new Intl.NumberFormat('vi-VN').format(
                              field.pricePerHour,
                            )}
                            đ/giờ
                          </p>
                        </div>
                        <span className="text-xs font-medium text-[#0F6E56] bg-[#0F6E56]/10 px-3 py-1 rounded-full">
                          Quản lý
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
