'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Court,
  CreateCourtInput,
  createCourt,
  getMyCourts,
} from '@/lib/api-client';
import {
  MapPin,
  Plus,
  X,
  Clock,
  Star,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

const STATUS_LABEL: Record<string, string> = {
  PENDING_APPROVAL: 'Chờ duyệt',
  ACTIVE: 'Hoạt động',
  INACTIVE: 'Không hoạt động',
};

const STATUS_COLOR: Record<string, string> = {
  PENDING_APPROVAL: 'bg-yellow-100 text-yellow-700',
  ACTIVE: 'bg-green-100 text-green-700',
  INACTIVE: 'bg-gray-100 text-gray-500',
};

export default function ManagerCourtsPage() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<CreateCourtInput>({
    name: '',
    location: '',
    latitude: undefined,
    longitude: undefined,
  });
  const [formError, setFormError] = useState<string | null>(null);

  const fetchCourts = useCallback(async () => {
    try {
      const data = await getMyCourts();
      setCourts(data);
    } catch {
      setError('Không thể tải danh sách sân.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourts();
  }, [fetchCourts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.location.trim()) {
      setFormError('Vui lòng nhập tên sân và địa chỉ.');
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      await createCourt(form);
      setShowModal(false);
      setForm({ name: '', location: '', latitude: undefined, longitude: undefined });
      await fetchCourts();
    } catch {
      setFormError('Tạo sân thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-lexend text-[#1F4D2B]">Sân của tôi</h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý và theo dõi các sân của bạn
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#D4FF00] hover:bg-[#c0e600] text-[#1F4D2B] font-semibold rounded-xl shadow-sm transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tạo sân mới
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Tổng sân', value: courts.length, color: 'text-[#1F4D2B]' },
          {
            label: 'Đang hoạt động',
            value: courts.filter((c) => c.status === 'ACTIVE').length,
            color: 'text-green-600',
          },
          {
            label: 'Chờ duyệt',
            value: courts.filter((c) => c.status === 'PENDING_APPROVAL').length,
            color: 'text-yellow-600',
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold font-lexend ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Court list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#1F4D2B]" />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center">{error}</div>
      ) : courts.length === 0 ? (
        <div className="bg-white rounded-xl p-16 shadow-sm border border-gray-100 text-center">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Chưa có sân nào</h3>
          <p className="text-gray-400 mb-6">Bắt đầu bằng cách tạo sân đầu tiên của bạn</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D4FF00] hover:bg-[#c0e600] text-[#1F4D2B] font-semibold rounded-xl transition-colors"
          >
            <Plus className="w-5 h-5" />
            Tạo sân mới
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {courts.map((court) => (
            <div
              key={court.id}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4FF00]/20 to-[#A8D700]/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-[#1F4D2B]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{court.name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {court.location}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5" />
                        {court._count?.fields ?? court.fields?.length ?? 0} sân con
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(court.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      STATUS_COLOR[court.status] ?? 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {court.status === 'PENDING_APPROVAL' && <AlertCircle className="w-3 h-3" />}
                    {court.status === 'ACTIVE' && <CheckCircle2 className="w-3 h-3" />}
                    {STATUS_LABEL[court.status] ?? court.status}
                  </span>
                  {court.status === 'PENDING_APPROVAL' && (
                    <p className="text-xs text-yellow-600">Đang chờ admin duyệt</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Court Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-[#1F4D2B] to-[#0F6E56]">
              <h2 className="text-lg font-bold font-lexend text-white">Tạo sân mới</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {formError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {formError}
                </div>
              )}

              <div>
                <label htmlFor="court-name" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tên sân <span className="text-red-500">*</span>
                </label>
                <input
                  id="court-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="VD: Sân Badminton Thành Đạt"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4FF00] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="court-location" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Địa chỉ <span className="text-red-500">*</span>
                </label>
                <input
                  id="court-location"
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  placeholder="VD: 123 Nguyễn Trãi, Quận 1, TP.HCM"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4FF00] focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="court-lat" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Vĩ độ
                  </label>
                  <input
                    id="court-lat"
                    type="number"
                    step="any"
                    value={form.latitude ?? ''}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        latitude: e.target.value ? Number(e.target.value) : undefined,
                      }))
                    }
                    placeholder="10.7769"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4FF00] focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="court-lng" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Kinh độ
                  </label>
                  <input
                    id="court-lng"
                    type="number"
                    step="any"
                    value={form.longitude ?? ''}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        longitude: e.target.value ? Number(e.target.value) : undefined,
                      }))
                    }
                    placeholder="106.7009"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4FF00] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-yellow-50 text-yellow-700 text-sm rounded-lg">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Sân mới tạo sẽ ở trạng thái <strong>chờ duyệt</strong>. Admin sẽ xác nhận để sân hoạt động.</span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-[#D4FF00] hover:bg-[#c0e600] disabled:opacity-50 text-[#1F4D2B] font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Đang tạo...' : 'Tạo sân'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
