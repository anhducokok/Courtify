'use client';

import { useState, useEffect } from 'react';
import {
  X,
  AlertCircle,
  Loader2,
  Trash2,
  Info,
} from 'lucide-react';
import {
  DAY_LABELS,
  PLAN_TYPE_CONFIG,
  minutesToTimeStr,
  formatVND,
  type FieldBookingPlan,
  type PlanType,
  type CreatePlanDto,
  type UpdatePlanDto,
} from '@/types/booking-plan';
import {
  useCreatePlan,
  useUpdatePlan,
  useDeletePlan,
} from '@/hooks/use-booking-plans';

interface PlanFormModalProps {
  fieldId: string;
  fieldName: string;
  fieldPricePerHour: number;
  plan?: FieldBookingPlan;
  initialDay?: number;
  initialStartTime?: number;
  initialEndTime?: number;
  onClose: () => void;
  onSuccess?: () => void;
  onDelete?: () => void;
}

const PLAN_TYPES: PlanType[] = ['AVAILABLE', 'BLOCKED', 'CUSTOM_PRICE'];
const PRIORITY_OPTIONS = [0, 1, 2, 3, 5, 8, 10];

function TimeInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const displayStr = minutesToTimeStr(value);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [h, m] = e.target.value.split(':').map(Number);
    onChange(h * 60 + m);
  };
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        type="time"
        value={displayStr}
        onChange={handleChange}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]/30 focus:border-[#0F6E56]"
      />
    </div>
  );
}

function DayChips({
  selected,
  onChange,
}: {
  selected: number[];
  onChange: (v: number[]) => void;
}) {
  const toggle = (day: number) => {
    if (selected.includes(day)) {
      onChange(selected.filter((d) => d !== day));
    } else {
      onChange([...selected, day].sort((a, b) => a - b));
    }
  };
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-2">
        Ngày trong tuần
      </label>
      <div className="flex gap-1.5 flex-wrap">
        {DAY_LABELS.map((d) => (
          <button
            key={d.value}
            type="button"
            onClick={() => toggle(d.value)}
            className={`w-10 h-10 rounded-lg text-xs font-semibold transition-all ${
              selected.includes(d.value)
                ? 'bg-[#0F6E56] text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {d.short}
          </button>
        ))}
      </div>
    </div>
  );
}

export function PlanFormModal({
  fieldId,
  fieldName,
  fieldPricePerHour,
  plan,
  initialDay,
  initialStartTime = 8 * 60,
  initialEndTime = 10 * 60,
  onClose,
  onSuccess,
  onDelete,
}: PlanFormModalProps) {
  const isEditing = !!plan;
  const [type, setType] = useState<PlanType>(plan?.type ?? 'AVAILABLE');
  const [priority, setPriority] = useState<number>(plan?.priority ?? 0);
  const [startTime, setStartTime] = useState<number>(plan?.startTime ?? initialStartTime);
  const [endTime, setEndTime] = useState<number>(plan?.endTime ?? initialEndTime);
  const [isRecurring, setIsRecurring] = useState<boolean>(plan?.isRecurring ?? true);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(
    plan?.daysOfWeek ?? (initialDay !== undefined ? [initialDay] : [1, 2, 3, 4, 5]),
  );
  const [specificDate, setSpecificDate] = useState<string>(
    plan?.specificDate ? plan.specificDate.slice(0, 10) : '',
  );
  const [priceOverride, setPriceOverride] = useState<string>(
    plan?.priceOverride?.toString() ?? '',
  );
  const [error, setError] = useState<string | null>(null);

  const createPlan = useCreatePlan(fieldId);
  const updatePlan = useUpdatePlan(fieldId);
  const deletePlan = useDeletePlan(fieldId);

  const isPending = createPlan.isPending || updatePlan.isPending || deletePlan.isPending;

  const validate = (): string | null => {
    if (endTime <= startTime) return 'Giờ kết thúc phải sau giờ bắt đầu.';
    if (endTime - startTime < 30) return 'Khung giờ phải ít nhất 30 phút.';
    if (isRecurring && daysOfWeek.length === 0)
      return 'Vui lòng chọn ít nhất một ngày trong tuần.';
    if (!isRecurring && !specificDate) return 'Vui lòng chọn ngày cụ thể.';
    if (type === 'CUSTOM_PRICE' && (!priceOverride || isNaN(Number(priceOverride)) || Number(priceOverride) <= 0))
      return 'Vui lòng nhập giá hợp lệ cho loại "Giá đặc biệt".';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError(null);

    const dto: CreatePlanDto | UpdatePlanDto = {
      type,
      priority,
      startTime,
      endTime,
      timezone: 'Asia/Ho_Chi_Minh',
      isRecurring,
      daysOfWeek: isRecurring ? daysOfWeek : undefined,
      specificDate: isRecurring ? undefined : specificDate,
      priceOverride: type === 'CUSTOM_PRICE' ? Number(priceOverride) : undefined,
    };

    try {
      if (isEditing) {
        await updatePlan.mutateAsync({ planId: plan!.id, dto: dto as UpdatePlanDto });
      } else {
        await createPlan.mutateAsync(dto as CreatePlanDto);
      }
      onSuccess?.();
    } catch {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
    }
  };

  const handleDelete = async () => {
    if (!plan) return;
    if (!confirm('Bạn có chắc muốn xóa rule này?')) return;
    try {
      await deletePlan.mutateAsync(plan.id);
      onDelete?.();
    } catch {
      setError('Không thể xóa rule. Vui lòng thử lại.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900 font-lexend">
              {isEditing ? 'Chỉnh sửa Rule' : 'Tạo Rule mới'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">{fieldName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Plan type */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Loại rule
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PLAN_TYPES.map((t) => {
                const cfg = PLAN_TYPE_CONFIG[t];
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all ${
                      type === t
                        ? `${cfg.color} border-current`
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <span
                      className={`w-3 h-3 rounded-full ${cfg.dotColor}`}
                      style={
                        type === t
                          ? {
                              backgroundColor:
                                t === 'AVAILABLE'
                                  ? '#22c55e'
                                  : t === 'BLOCKED'
                                  ? '#ef4444'
                                  : '#eab308',
                            }
                          : undefined
                      }
                    />
                    <span className="text-xs font-semibold">{cfg.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time range */}
          <div className="grid grid-cols-2 gap-3">
            <TimeInput label="Bắt đầu" value={startTime} onChange={setStartTime} />
            <TimeInput label="Kết thúc" value={endTime} onChange={setEndTime} />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Priority{' '}
              <span className="text-gray-400 font-normal">
                (số cao hơn ghi đè thấp hơn khi xung đột)
              </span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {PRIORITY_OPTIONS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`w-10 h-8 rounded-lg text-xs font-semibold transition-all ${
                    priority === p
                      ? 'bg-[#0F6E56] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Recurring toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsRecurring(!isRecurring)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                isRecurring ? 'bg-[#0F6E56]' : 'bg-gray-200'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  isRecurring ? 'left-7' : 'left-1'
                }`}
              />
            </button>
            <div>
              <p className="text-sm font-medium text-gray-800">
                {isRecurring ? 'Lặp hàng tuần' : 'Ngoại lệ (một ngày cụ thể)'}
              </p>
              <p className="text-xs text-gray-500">
                {isRecurring
                  ? 'Rule áp dụng cho các ngày được chọn mỗi tuần'
                  : 'Rule chỉ áp dụng cho một ngày duy nhất'}
              </p>
            </div>
          </div>

          {/* Days or specific date */}
          {isRecurring ? (
            <DayChips selected={daysOfWeek} onChange={setDaysOfWeek} />
          ) : (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Ngày cụ thể
              </label>
              <input
                type="date"
                value={specificDate}
                onChange={(e) => setSpecificDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]/30 focus:border-[#0F6E56]"
              />
            </div>
          )}

          {/* Price override (only for CUSTOM_PRICE) */}
          {type === 'CUSTOM_PRICE' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Giá override{' '}
                <span className="text-gray-400 font-normal">
                  (mặc định: {formatVND(fieldPricePerHour)}/giờ)
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="10000"
                  placeholder="VD: 300000"
                  value={priceOverride}
                  onChange={(e) => setPriceOverride(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg pl-12 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]/30 focus:border-[#0F6E56]"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                  ₫
                </span>
              </div>
              {priceOverride && (
                <p className="text-xs text-[#0F6E56] mt-1">
                  {formatVND(Number(priceOverride))}/giờ
                  {Number(priceOverride) > fieldPricePerHour ? (
                    <span className="text-orange-600 ml-2">↑ cao hơn giá mặc định</span>
                  ) : (
                    <span className="text-blue-600 ml-2">↓ thấp hơn giá mặc định</span>
                  )}
                </p>
              )}
            </div>
          )}

          {/* Info box */}
          <div className="flex gap-2.5 rounded-xl bg-blue-50 border border-blue-100 p-3">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-700 space-y-0.5">
              <p>
                <strong>AVAILABLE</strong>: Mở bán sân trong khung giờ này.
              </p>
              <p>
                <strong>BLOCKED</strong>: Đóng/khóa sân (bảo trì, nghỉ lễ...).
              </p>
              <p>
                <strong>CUSTOM_PRICE</strong>: Ghi đè giá mặc định cho khung giờ này.
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium transition-colors disabled:opacity-50"
              >
                {deletePlan.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Xóa
              </button>
            )}
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[#0F6E56] text-white hover:bg-[#1F4D2B] text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {isEditing ? 'Lưu thay đổi' : 'Tạo Rule'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
