'use client';

import { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  CalendarDays,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react';
import {
  PLAN_TYPE_CONFIG,
  minutesToTimeStr,
  formatVND,
  type FieldBookingPlan,
} from '@/types/booking-plan';
import {
  useCreatePlan,
  useUpdatePlan,
  useDeletePlan,
} from '@/hooks/use-booking-plans';
import { PlanFormModal } from './plan-form-modal';

interface ExceptionsManagerProps {
  fieldId: string;
  fieldName: string;
  fieldPricePerHour: number;
  exceptions: FieldBookingPlan[];
  onDeleted?: () => void;
  onCreated?: () => void;
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function ExceptionsManager({
  fieldId,
  fieldName,
  fieldPricePerHour,
  exceptions,
  onDeleted,
  onCreated,
}: ExceptionsManagerProps) {
  const [editingException, setEditingException] = useState<FieldBookingPlan | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-[#0F6E56]" />
            <h3 className="font-semibold text-gray-800 text-sm">
              Ngoại lệ (Exception)
            </h3>
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
              {exceptions.length}
            </span>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F6E56] text-white text-xs font-semibold hover:bg-[#1F4D2B] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm ngoại lệ
          </button>
        </div>

        {/* List */}
        {exceptions.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center px-6">
            <CalendarDays className="w-10 h-10 text-gray-300" />
            <p className="text-sm text-gray-500">
              Chưa có ngoại lệ nào cho sân này.
            </p>
            <p className="text-xs text-gray-400">
              Ngoại lệ là các rule chỉ áp dụng cho một ngày cụ thể (ví dụ: lễ
              tết, sự kiện đặc biệt).
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {exceptions.map((exc) => (
              <ExceptionRow
                key={exc.id}
                exception={exc}
                fieldPricePerHour={fieldPricePerHour}
                onEdit={() => setEditingException(exc)}
                onDeleted={onDeleted}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreateModal && (
        <PlanFormModal
          fieldId={fieldId}
          fieldName={fieldName}
          fieldPricePerHour={fieldPricePerHour}
          initialDay={undefined}
          initialStartTime={8 * 60}
          initialEndTime={22 * 60}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            onCreated?.();
          }}
        />
      )}

      {/* Edit modal */}
      {editingException && (
        <PlanFormModal
          fieldId={fieldId}
          fieldName={fieldName}
          fieldPricePerHour={fieldPricePerHour}
          plan={editingException}
          onClose={() => setEditingException(null)}
          onSuccess={() => setEditingException(null)}
          onDelete={() => {
            setEditingException(null);
            onDeleted?.();
          }}
        />
      )}
    </>
  );
}

function ExceptionRow({
  exception,
  fieldPricePerHour,
  onEdit,
  onDeleted,
}: {
  exception: FieldBookingPlan;
  fieldPricePerHour: number;
  onEdit: () => void;
  onDeleted?: () => void;
}) {
  const deletePlan = useDeletePlan(exception.fieldId);
  const cfg = PLAN_TYPE_CONFIG[exception.type];

  const handleDelete = async () => {
    if (!confirm('Xóa ngoại lệ này?')) return;
    await deletePlan.mutateAsync(exception.id);
    onDeleted?.();
  };

  return (
    <div className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/60 transition-colors group">
      {/* Color dot */}
      <span
        className="w-3 h-3 rounded-full shrink-0"
        style={{
          backgroundColor:
            exception.type === 'AVAILABLE'
              ? '#22c55e'
              : exception.type === 'BLOCKED'
              ? '#ef4444'
              : '#eab308',
        }}
      />

      {/* Date */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">
          {exception.specificDate ? formatDateShort(exception.specificDate) : '—'}
        </p>
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${cfg.color}`}
          >
            {cfg.label}
          </span>
          {minutesToTimeStr(exception.startTime)} –{' '}
          {minutesToTimeStr(exception.endTime)}
          {exception.priceOverride && (
            <span className="text-[#0F6E56] font-medium ml-1">
              · {formatVND(exception.priceOverride)}
            </span>
          )}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
          title="Chỉnh sửa"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleDelete}
          disabled={deletePlan.isPending}
          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
          title="Xóa"
        >
          {deletePlan.isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
