'use client';

import { useState, useCallback } from 'react';
import {
  DAY_LABELS,
  PLAN_TYPE_CONFIG,
  WEEKDAY_ORDER,
  minutesToTimeStr,
  formatVND,
  type FieldBookingPlan,
  type PlanType,
} from '@/types/booking-plan';
import { PlanFormModal } from './plan-form-modal';

interface WeeklyCalendarGridProps {
  fieldId: string;
  fieldName: string;
  fieldPricePerHour: number;
  plans: FieldBookingPlan[];
  onPlanCreated?: () => void;
  onPlanUpdated?: () => void;
  onPlanDeleted?: () => void;
}

const GRID_START = 6 * 60; // 06:00
const GRID_END = 23 * 60;  // 23:00
const SLOT_HEIGHT = 3;     // pixels per minute

function getTimeLines(start: number, end: number): number[] {
  const lines: number[] = [];
  for (let t = start; t <= end; t += 60) lines.push(t);
  return lines;
}

const timeLines = getTimeLines(GRID_START, GRID_END);

function getPlanColor(type: PlanType): string {
  if (type === 'AVAILABLE') return 'bg-green-400/60 border-green-500';
  if (type === 'BLOCKED') return 'bg-red-400/60 border-red-500';
  return 'bg-yellow-400/60 border-yellow-500';
}

function planOverlaps(plan: FieldBookingPlan, day: number): boolean {
  if (plan.isRecurring) {
    return plan.daysOfWeek.includes(day);
  }
  return false;
}

export function WeeklyCalendarGrid({
  fieldId,
  fieldName,
  fieldPricePerHour,
  plans,
  onPlanCreated,
  onPlanUpdated,
  onPlanDeleted,
}: WeeklyCalendarGridProps) {
  const [selectedPlan, setSelectedPlan] = useState<FieldBookingPlan | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [createParams, setCreateParams] = useState<{
    day: number;
    startTime: number;
    endTime: number;
  } | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{
    day: number;
    time: number;
  } | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ day: number; time: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ day: number; time: number } | null>(null);

  const totalMinutes = GRID_END - GRID_START;
  const gridHeight = totalMinutes * SLOT_HEIGHT;

  // Build drag selection rect
  const dragRect =
    dragStart && dragCurrent
      ? {
          left: Math.min(dragStart.day, dragCurrent.day),
          right: Math.max(dragStart.day, dragCurrent.day),
          top: Math.min(dragStart.time, dragCurrent.time),
          bottom: Math.max(dragStart.time, dragCurrent.time),
        }
      : null;

  const handleCellMouseDown = useCallback(
    (day: number, time: number) => {
      setIsDragging(true);
      setDragStart({ day, time });
      setDragCurrent({ day, time });
    },
    [],
  );

  const handleCellMouseEnter = useCallback(
    (day: number, time: number) => {
      if (isDragging) {
        setDragCurrent({ day, time });
      }
    },
    [isDragging],
  );

  const handleMouseUp = useCallback(() => {
    if (dragStart && dragCurrent) {
      const start = Math.min(dragStart.time, dragCurrent.time);
      const end = Math.max(dragStart.time, dragCurrent.time);
      const snappedStart = Math.floor(start / 30) * 30;
      const snappedEnd = Math.ceil(end / 30) * 30;
      setCreateParams({
        day: dragStart.day,
        startTime: snappedStart,
        endTime: snappedEnd,
      });
      setModalMode('create');
    }
    setIsDragging(false);
    setDragStart(null);
    setDragCurrent(null);
  }, [dragStart, dragCurrent]);

  // Close drag if mouse leaves the grid
  const handleGridMouseLeave = useCallback(() => {
    if (isDragging) {
      handleMouseUp();
    }
  }, [isDragging, handleMouseUp]);

  const openEditModal = (plan: FieldBookingPlan) => {
    setSelectedPlan(plan);
    setModalMode('edit');
  };

  const isInDragRect = (day: number, time: number): boolean => {
    if (!dragRect) return false;
    return (
      day >= dragRect.left &&
      day <= dragRect.right &&
      time >= dragRect.top &&
      time <= dragRect.bottom
    );
  };

  // Sort plans by priority descending for display
  const sortedPlans = [...plans].sort((a, b) => b.priority - a.priority);

  return (
    <>
      <div
        className="overflow-x-auto select-none"
        onMouseUp={handleMouseUp}
        onMouseLeave={handleGridMouseLeave}
      >
        <div className="min-w-[700px]">
          {/* Header row: days */}
          <div className="flex border-b border-gray-200">
            <div className="w-16 shrink-0" />
            {WEEKDAY_ORDER.map((dayVal) => {
              const label = DAY_LABELS.find((d) => d.value === dayVal)!;
              return (
                <div
                  key={dayVal}
                  className="flex-1 text-center py-3 text-sm font-semibold text-gray-700 border-l border-gray-100"
                >
                  <div>{label.short}</div>
                  <div className="text-xs font-normal text-gray-400">{label.full}</div>
                </div>
              );
            })}
          </div>

          {/* Grid body */}
          <div className="relative flex" style={{ height: gridHeight }}>
            {/* Time labels column */}
            <div className="w-16 shrink-0 relative">
              {timeLines.map((t) => (
                <div
                  key={t}
                  className="absolute text-xs text-gray-400 pr-2 text-right"
                  style={{
                    top: (t - GRID_START) * SLOT_HEIGHT,
                    transform: 'translateY(-50%)',
                    width: '4rem',
                  }}
                >
                  {minutesToTimeStr(t)}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {WEEKDAY_ORDER.map((dayVal) => {
              const isWeekend = dayVal === 0 || dayVal === 6;
              return (
                <div
                  key={dayVal}
                  className={`flex-1 relative border-l border-gray-100 ${
                    isWeekend ? 'bg-gray-50/50' : 'bg-white'
                  }`}
                >
                  {/* Hour lines */}
                  {timeLines.map((t) => (
                    <div
                      key={t}
                      className="absolute left-0 right-0 border-t border-dashed border-gray-200/70"
                      style={{ top: (t - GRID_START) * SLOT_HEIGHT }}
                    />
                  ))}

                  {/* Plan blocks */}
                  {sortedPlans
                    .filter((p) => planOverlaps(p, dayVal))
                    .map((plan) => {
                      const top = (plan.startTime - GRID_START) * SLOT_HEIGHT;
                      const height = (plan.endTime - plan.startTime) * SLOT_HEIGHT;
                      const cfg = PLAN_TYPE_CONFIG[plan.type];
                      return (
                        <button
                          key={plan.id}
                          title={`${cfg.label}: ${minutesToTimeStr(plan.startTime)} - ${minutesToTimeStr(plan.endTime)}${
                            plan.priceOverride ? ` | ${formatVND(plan.priceOverride)}` : ''
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(plan);
                          }}
                          className={`absolute left-1 right-1 rounded-md border cursor-pointer hover:brightness-90 transition-all z-10 overflow-hidden ${getPlanColor(plan.type)}`}
                          style={{ top, height: Math.max(height, 20) }}
                        >
                          <div className="px-1.5 py-0.5 text-xs font-medium text-white truncate leading-tight">
                            {minutesToTimeStr(plan.startTime)}-{minutesToTimeStr(plan.endTime)}
                          </div>
                          {plan.endTime - plan.startTime >= 60 && (
                            <div className="px-1.5 text-[10px] text-white/80 truncate leading-tight">
                              {cfg.label}
                              {plan.priceOverride && ` · ${formatVND(plan.priceOverride)}`}
                            </div>
                          )}
                        </button>
                      );
                    })}

                  {/* Drag selection overlay */}
                  {dragRect && isInDragRect(dayVal, hoveredCell?.time ?? -1) && (
                    <div
                      className="absolute left-0 right-0 bg-[#0F6E56]/10 border-2 border-dashed border-[#0F6E56] rounded z-20 pointer-events-none"
                      style={{
                        top:
                          (Math.min(dragStart!.time, dragCurrent!.time) -
                            GRID_START) *
                          SLOT_HEIGHT,
                        height:
                          Math.abs(dragCurrent!.time - dragStart!.time) *
                          SLOT_HEIGHT,
                      }}
                    />
                  )}

                  {/* Clickable cells (for drag-to-select) */}
                  {Array.from({ length: totalMinutes / 30 }, (_, i) => {
                    const t = GRID_START + i * 30;
                    return (
                      <div
                        key={t}
                        className="absolute left-0 right-0 cursor-crosshair hover:bg-[#0F6E56]/5 transition-colors"
                        style={{
                          top: (t - GRID_START) * SLOT_HEIGHT,
                          height: 30 * SLOT_HEIGHT,
                        }}
                        onMouseDown={() => handleCellMouseDown(dayVal, t)}
                        onMouseEnter={() => handleCellMouseEnter(dayVal, t)}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hint */}
      <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
        Kéo chọn một khung giờ để tạo rule mới. Click vào block để chỉnh sửa.
      </p>

      {/* Legend */}
      <div className="flex gap-4 mt-3">
        {Object.entries(PLAN_TYPE_CONFIG).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className={`w-3 h-3 rounded-sm ${cfg.dotColor}`} />
            {cfg.label}
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 ml-auto">
          Priority hiện tại của sân:{' '}
          <span className="font-medium text-gray-700">{formatVND(fieldPricePerHour)}/giờ</span>
        </div>
      </div>

      {/* Plan form modal */}
      {modalMode === 'create' && createParams && (
        <PlanFormModal
          fieldId={fieldId}
          fieldName={fieldName}
          fieldPricePerHour={fieldPricePerHour}
          initialDay={createParams.day}
          initialStartTime={createParams.startTime}
          initialEndTime={createParams.endTime}
          onClose={() => {
            setCreateParams(null);
            setModalMode('edit');
          }}
          onSuccess={() => {
            setCreateParams(null);
            setModalMode('edit');
            onPlanCreated?.();
          }}
        />
      )}

      {modalMode === 'edit' && selectedPlan && (
        <PlanFormModal
          fieldId={fieldId}
          fieldName={fieldName}
          fieldPricePerHour={fieldPricePerHour}
          plan={selectedPlan}
          onClose={() => {
            setSelectedPlan(null);
            setModalMode('create');
          }}
          onSuccess={() => {
            setSelectedPlan(null);
            setModalMode('create');
            onPlanUpdated?.();
          }}
          onDelete={() => {
            setSelectedPlan(null);
            setModalMode('create');
            onPlanDeleted?.();
          }}
        />
      )}
    </>
  );
}
