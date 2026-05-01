'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Court,
  CreateCourtInput,
  createCourt,
  getMyCourts,
  CourtField,
  CreateFieldInput,
  UpdateFieldInput,
  createField,
  updateField,
  deleteField,
  getFieldsByCourt,
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
  Settings2,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
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

// ── Feature badge map ──────────────────────────────────────────────────

const FEATURES = [
  { value: 'LED',              label: 'LED',            color: 'bg-purple-100 text-purple-700' },
  { value: 'VIP',             label: 'VIP',           color: 'bg-amber-100 text-amber-700' },
  { value: 'ROOFED',          label: 'Có mái',        color: 'bg-blue-100 text-blue-700' },
  { value: 'AIR_CONDITIONED', label: 'Điều hòa',     color: 'bg-cyan-100 text-cyan-700' },
] as const;

const FEATURE_LABELS: Record<string, string> = {
  LED: 'LED',
  VIP: 'VIP',
  ROOFED: 'Có mái',
  AIR_CONDITIONED: 'Điều hòa',
};

function formatPrice(n: number) {
  return n.toLocaleString('vi-VN') + 'đ';
}

// ── Field Modal ────────────────────────────────────────────────────────

type FieldModalMode = 'create' | 'edit';

interface FieldModalProps {
  mode: FieldModalMode;
  courtId: string;
  field?: CourtField;
  onClose: () => void;
  onSaved: (saved: CourtField) => void;
}

function FieldModal({ mode, courtId, field, onClose, onSaved }: FieldModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [form, setForm] = useState<CreateFieldInput>({
    name: field?.name ?? '',
    pricePerHour: field?.pricePerHour ?? 0,
    features: field?.features ?? [],
  });

  const isEdit = mode === 'edit';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError('Vui lòng nhập tên sân con.');
      return;
    }
    if (!form.pricePerHour || form.pricePerHour <= 0) {
      setFormError('Vui lòng nhập giá giờ hợp lệ.');
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      let saved: CourtField;
      if (isEdit) {
        saved = await updateField(field!.id, form as UpdateFieldInput);
      } else {
        saved = await createField(courtId, form);
      }
      onSaved(saved);
      onClose();
    } catch {
      setFormError(isEdit ? 'Cập nhật thất bại.' : 'Tạo sân con thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleFeature = (f: string) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features?.includes(f as any)
        ? (prev.features as string[]).filter((x) => x !== f)
        : [...(prev.features ?? []), f],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-[#1F4D2B] to-[#0F6E56]">
          <h2 className="text-lg font-bold font-lexend text-white">
            {isEdit ? 'Chỉnh sửa sân' : 'Thêm sân con'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {formError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {formError}
            </div>
          )}

          <div>
            <label htmlFor="field-name" className="block text-sm font-medium text-gray-700 mb-1.5">
              Tên sân con <span className="text-red-500">*</span>
            </label>
            <input
              id="field-name"
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="VD: Sân 1, Sân VIP"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4FF00] focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="field-price" className="block text-sm font-medium text-gray-700 mb-1.5">
              Giá / giờ (VNĐ) <span className="text-red-500">*</span>
            </label>
            <input
              id="field-price"
              type="number"
              min="0"
              step="1000"
              value={form.pricePerHour}
              onChange={(e) =>
                setForm((f) => ({ ...f, pricePerHour: Number(e.target.value) }))
              }
              placeholder="150000"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4FF00] focus:border-transparent"
            />
            {form.pricePerHour > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                ≈ {formatPrice(form.pricePerHour)} / giờ
              </p>
            )}
          </div>

          <div>
            <p className="block text-sm font-medium text-gray-700 mb-2">Tiện ích</p>
            <div className="flex flex-wrap gap-2">
              {FEATURES.map((f) => {
                const active = form.features?.includes(f.value as any);
                return (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => toggleFeature(f.value)}
                    className={[
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                      active
                        ? `${f.color} border-transparent`
                        : 'bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300',
                    ].join(' ')}
                  >
                    {f.label}
                    {active && <CheckCircle2 className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
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
              {submitting ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Thêm sân'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ManagerCourtsPage() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Field management state ─────────────────────────────────────────
  const [expandedCourts, setExpandedCourts] = useState<Set<string>>(new Set());
  const [courtFields, setCourtFields] = useState<Record<string, CourtField[]>>({});
  const [fieldsLoading, setFieldsLoading] = useState<Set<string>>(new Set());
  const [fieldModal, setFieldModal] = useState<{
    mode: FieldModalMode;
    courtId: string;
    field?: CourtField;
  } | null>(null);
  const [deletingFieldId, setDeletingFieldId] = useState<string | null>(null);

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

  // ── Load fields for a court when expanded ────────────────────────
  const toggleCourt = useCallback(async (courtId: string) => {
    const next = new Set(expandedCourts);
    if (next.has(courtId)) {
      next.delete(courtId);
    } else {
      next.add(courtId);
      if (!courtFields[courtId]) {
        setFieldsLoading((prev) => new Set(prev).add(courtId));
        try {
          const fields = await getFieldsByCourt(courtId);
          setCourtFields((prev) => ({ ...prev, [courtId]: fields }));
        } finally {
          setFieldsLoading((prev) => {
            const next = new Set(prev);
            next.delete(courtId);
            return next;
          });
        }
      }
    }
    setExpandedCourts(next);
  }, [expandedCourts, courtFields]);

  const handleSavedField = useCallback((courtId: string, saved: CourtField) => {
    setCourtFields((prev) => {
      const existing = prev[courtId] ?? [];
      const idx = existing.findIndex((f) => f.id === saved.id);
      if (idx >= 0) {
        const next = [...existing];
        next[idx] = saved;
        return { ...prev, [courtId]: next };
      }
      return { ...prev, [courtId]: [...existing, saved] };
    });
    // Update court's field count in the courts list
    setCourts((prev) =>
      prev.map((c) =>
        c.id === courtId
          ? { ...c, _count: { fields: (c._count?.fields ?? c.fields?.length ?? 0) + 1 } }
          : c,
      ),
    );
  }, []);

  const handleDeleteField = useCallback(async (courtId: string, fieldId: string) => {
    if (!confirm('Xóa sân con này? Hành động không thể hoàn tác.')) return;
    setDeletingFieldId(fieldId);
    try {
      await deleteField(fieldId);
      setCourtFields((prev) => ({
        ...prev,
        [courtId]: (prev[courtId] ?? []).filter((f) => f.id !== fieldId),
      }));
      setCourts((prev) =>
        prev.map((c) =>
          c.id === courtId
            ? { ...c, _count: { fields: Math.max(0, (c._count?.fields ?? 1) - 1) } }
            : c,
        ),
      );
    } finally {
      setDeletingFieldId(null);
    }
  }, []);

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
          {courts.map((court) => {
            const isExpanded = expandedCourts.has(court.id);
            const fields = courtFields[court.id] ?? [];
            const isLoadingFields = fieldsLoading.has(court.id);

            return (
              <div
                key={court.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                {/* Court card header */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4FF00]/20 to-[#A8D700]/20 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6 text-[#1F4D2B]" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900">{court.name}</h3>
                        <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{court.location}</span>
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

                    {/* Right: status + actions */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
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
                        <p className="text-xs text-yellow-600">Chờ admin duyệt</p>
                      )}

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 mt-1">
                        {/* Manage fields */}
                        <button
                          onClick={() => toggleCourt(court.id)}
                          className={[
                            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                            isExpanded
                              ? 'bg-[#0F6E56] text-white border-[#0F6E56]'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-[#0F6E56] hover:text-[#0F6E56]',
                          ].join(' ')}
                        >
                          <LayoutGrid className="w-3.5 h-3.5" />
                          {isExpanded ? 'Thu gọn' : 'Quản lý sân'}
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>

                        {/* View detail */}
                        <button
                          onClick={() => window.location.href = `/courts/${court.id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:border-[#0F6E56] hover:text-[#0F6E56] transition-all"
                        >
                          <Settings2 className="w-3.5 h-3.5" />
                          Chi tiết
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expandable fields panel */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50/50">
                    <div className="px-5 py-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-700">
                          Danh sách sân con
                          <span className="ml-2 text-xs font-normal text-gray-400">
                            ({fields.length})
                          </span>
                        </h4>
                        <button
                          onClick={() => setFieldModal({ mode: 'create', courtId: court.id })}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#D4FF00] hover:bg-[#c0e600] text-[#1F4D2B] text-xs font-semibold rounded-lg transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Thêm sân
                        </button>
                      </div>

                      {isLoadingFields ? (
                        <div className="flex justify-center py-6">
                          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                        </div>
                      ) : fields.length === 0 ? (
                        <div className="text-center py-6 text-sm text-gray-400">
                          Chưa có sân con nào. Bấm "Thêm sân" để bắt đầu.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {fields.map((f) => (
                            <div
                              key={f.id}
                              className="bg-white rounded-xl p-4 border border-gray-200 hover:border-[#0F6E56]/30 transition-colors group"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-800 truncate">{f.name}</p>
                                  <p className="text-xs font-medium text-[#0F6E56] mt-0.5">
                                    {formatPrice(f.pricePerHour)}/giờ
                                  </p>
                                  {f.features && f.features.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {f.features.map((feat) => (
                                        <span
                                          key={feat}
                                          className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600"
                                        >
                                          {FEATURE_LABELS[feat] ?? feat}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() =>
                                      setFieldModal({ mode: 'edit', courtId: court.id, field: f })
                                    }
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                    title="Chỉnh sửa"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteField(court.id, f.id)}
                                    disabled={deletingFieldId === f.id}
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                    title="Xóa"
                                  >
                                    {deletingFieldId === f.id ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Court Modal + Field Modal */}
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
                  <label htmlFor="court-lat" className="block text-sm font-medium text-gray-700 mb-1.5">Vĩ độ</label>
                  <input
                    id="court-lat"
                    type="number"
                    step="any"
                    value={form.latitude ?? ''}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, latitude: e.target.value ? Number(e.target.value) : undefined }))
                    }
                    placeholder="10.7769"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4FF00] focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="court-lng" className="block text-sm font-medium text-gray-700 mb-1.5">Kinh độ</label>
                  <input
                    id="court-lng"
                    type="number"
                    step="any"
                    value={form.longitude ?? ''}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, longitude: e.target.value ? Number(e.target.value) : undefined }))
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

      {fieldModal && (
        <FieldModal
          mode={fieldModal.mode}
          courtId={fieldModal.courtId}
          field={fieldModal.field}
          onClose={() => setFieldModal(null)}
          onSaved={(saved) => {
            handleSavedField(fieldModal.courtId, saved);
            setFieldModal(null);
          }}
        />
      )}
    </div>
  );
}
