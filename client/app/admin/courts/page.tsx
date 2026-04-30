'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Court,
  CourtStatus,
  getPendingCourts,
  updateCourtStatus,
} from '@/lib/api-client';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import {
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  RefreshCw,
  Mail,
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

export default function AdminCourtsPage() {
  const [pending, setPending] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchPending = useCallback(async () => {
    try {
      const data = await getPendingCourts();
      setPending(data);
      setError(null);
    } catch {
      setError('Không thể tải danh sách sân chờ duyệt.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleAction = async (courtId: string, status: CourtStatus) => {
    setActionLoading(courtId);
    setSuccessMsg(null);
    try {
      await updateCourtStatus(courtId, status);
      setPending((prev) => prev.filter((c) => c.id !== courtId));
      setSuccessMsg(
        status === 'ACTIVE'
          ? 'Sân đã được phê duyệt thành công!'
          : 'Sân đã bị từ chối.',
      );
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch {
      setError('Thao tác thất bại. Vui lòng thử lại.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <DashboardLayout isAdmin={true} headerTitle="Quản lý sân" headerSubtitle="Phê duyệt sân mới từ chủ sân">
      <div className="max-w-4xl">
        {/* Alert */}
        {error && (
          <div className="flex items-center gap-2 p-4 mb-6 bg-red-50 text-red-600 rounded-xl text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
            <button onClick={fetchPending} className="ml-auto underline">Thử lại</button>
          </div>
        )}
        {successMsg && (
          <div className="flex items-center gap-2 p-4 mb-6 bg-green-50 text-green-700 rounded-xl text-sm">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            {successMsg}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold font-lexend text-gray-900">Sân chờ phê duyệt</h2>
            <p className="text-sm text-gray-500 mt-1">
              {pending.length > 0
                ? `Có ${pending.length} sân đang chờ bạn xác nhận`
                : 'Không có sân nào đang chờ phê duyệt'}
            </p>
          </div>
          <button
            onClick={fetchPending}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Làm mới
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#1F4D2B]" />
          </div>
        ) : pending.length === 0 ? (
          <div className="bg-white rounded-xl p-16 shadow-sm border border-gray-100 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Tất cả đã xử lý!</h3>
            <p className="text-gray-500">Không có sân nào đang chờ phê duyệt.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map((court) => (
              <div
                key={court.id}
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-yellow-700" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">{court.name}</h3>
                      <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {court.location}
                      </p>
                      {court.owner && (
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          {court.owner.name ?? court.owner.email} · {court.owner.email}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLOR[court.status]}`}>
                          <Clock className="w-3 h-3" />
                          {STATUS_LABEL[court.status]}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(court.createdAt).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="text-xs text-gray-500">
                          {court._count?.fields ?? 0} sân con
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleAction(court.id, 'ACTIVE')}
                      disabled={actionLoading === court.id}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
                    >
                      {actionLoading === court.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      Phê duyệt
                    </button>
                    <button
                      onClick={() => handleAction(court.id, 'INACTIVE')}
                      disabled={actionLoading === court.id}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-200 hover:border-red-300 hover:bg-red-50 disabled:opacity-50 text-gray-600 hover:text-red-600 text-sm font-medium rounded-xl transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Từ chối
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
