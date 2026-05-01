'use client';

import { useState } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Calendar,
  Trash2,
  X,
  ChevronRight,
} from 'lucide-react';

interface Court {
  id: string;
  name: string;
  floorType: 'Gỗ' | 'Cao su' | 'Nhựa';
  lighting: 'LED' | 'Thường';
  priceNormal: number;
  pricePeak: number;
  active: boolean;
}

const INITIAL_COURTS: Court[] = [
  { id: '1', name: 'Sân A1', floorType: 'Gỗ', lighting: 'LED', priceNormal: 100000, pricePeak: 150000, active: true },
  { id: '2', name: 'Sân A2', floorType: 'Gỗ', lighting: 'LED', priceNormal: 100000, pricePeak: 150000, active: true },
  { id: '3', name: 'Sân A3', floorType: 'Cao su', lighting: 'Thường', priceNormal: 80000, pricePeak: 120000, active: true },
  { id: '4', name: 'Sân A4', floorType: 'Cao su', lighting: 'LED', priceNormal: 80000, pricePeak: 120000, active: true },
  { id: '5', name: 'Sân A5', floorType: 'Nhựa', lighting: 'Thường', priceNormal: 60000, pricePeak: 90000, active: true },
  { id: '6', name: 'Sân A6', floorType: 'Nhựa', lighting: 'LED', priceNormal: 60000, pricePeak: 90000, active: false },
];

const FLOOR_BADGE: Record<string, string> = {
  'Gỗ': 'bg-amber-50 text-amber-700 border border-amber-200',
  'Cao su': 'bg-blue-50 text-blue-700 border border-blue-200',
  'Nhựa': 'bg-gray-50 text-gray-600 border border-gray-200',
};

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN').format(n) + 'đ';

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
        checked ? 'bg-[#0F6E56]' : 'bg-gray-200'
      }`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

export default function OwnerCourtsPage() {
  const [courts, setCourts] = useState<Court[]>(INITIAL_COURTS);
  const [search, setSearch] = useState('');
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Court>>({});
  const [inlineEdit, setInlineEdit] = useState<{ id: string; field: 'priceNormal' | 'pricePeak' } | null>(null);
  const [inlineValue, setInlineValue] = useState('');

  const filtered = courts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleEditOpen = (court: Court) => {
    setEditingCourt(court);
    setEditForm({ ...court });
  };

  const handleEditSave = () => {
    if (!editingCourt) return;
    setCourts((prev) =>
      prev.map((c) => (c.id === editingCourt.id ? { ...c, ...editForm } as Court : c))
    );
    setEditingCourt(null);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setCourts((prev) => prev.filter((c) => c.id !== deleteId));
    setDeleteId(null);
  };

  const handleInlineEdit = (court: Court, field: 'priceNormal' | 'pricePeak') => {
    setInlineEdit({ id: court.id, field });
    setInlineValue(String(court[field]));
  };

  const handleInlineSave = (courtId: string) => {
    const val = Number(inlineValue);
    if (!isNaN(val)) {
      setCourts((prev) =>
        prev.map((c) =>
          c.id === courtId
            ? { ...c, [inlineEdit!.field]: val }
            : c
        )
      );
    }
    setInlineEdit(null);
  };

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-lexend text-[#085041]">Quản lý sân</h1>
          <p className="text-sm text-gray-400 mt-0.5">Sân Cầu Lông Hưng Dũng — 6 sân</p>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm sân..."
            className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-full"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#0F6E56] hover:bg-[#085041] text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap">
          <Plus className="w-4 h-4" />
          Thêm sân mới
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {['Tên sân', 'Loại sàn', 'Đèn', 'Giá giờ thường', 'Giá giờ cao điểm', 'Trạng thái', 'Thao tác'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((court) => (
              <tr key={court.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3.5">
                  <span className="font-semibold text-gray-900 text-sm">{court.name}</span>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${FLOOR_BADGE[court.floorType]}`}>
                    {court.floorType}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold ${court.lighting === 'LED' ? 'text-green-600' : 'text-gray-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${court.lighting === 'LED' ? 'bg-green-500' : 'bg-gray-300'}`} />
                    {court.lighting}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  {inlineEdit?.id === court.id && inlineEdit.field === 'priceNormal' ? (
                    <input
                      autoFocus
                      value={inlineValue}
                      onChange={(e) => setInlineValue(e.target.value)}
                      onBlur={() => handleInlineSave(court.id)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleInlineSave(court.id); if (e.key === 'Escape') setInlineEdit(null); }}
                      className="w-28 px-2 py-1 text-sm border border-[#0F6E56] rounded-lg outline-none"
                    />
                  ) : (
                    <button
                      onClick={() => handleInlineEdit(court, 'priceNormal')}
                      className="text-sm font-semibold text-[#0F6E56] hover:underline text-left"
                    >
                      {fmt(court.priceNormal)}
                    </button>
                  )}
                </td>
                <td className="px-4 py-3.5">
                  {inlineEdit?.id === court.id && inlineEdit.field === 'pricePeak' ? (
                    <input
                      autoFocus
                      value={inlineValue}
                      onChange={(e) => setInlineValue(e.target.value)}
                      onBlur={() => handleInlineSave(court.id)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleInlineSave(court.id); if (e.key === 'Escape') setInlineEdit(null); }}
                      className="w-28 px-2 py-1 text-sm border border-[#0F6E56] rounded-lg outline-none"
                    />
                  ) : (
                    <button
                      onClick={() => handleInlineEdit(court, 'pricePeak')}
                      className="text-sm font-semibold text-[#0F6E56] hover:underline text-left"
                    >
                      {fmt(court.pricePeak)}
                    </button>
                  )}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <ToggleSwitch
                      checked={court.active}
                      onChange={(v) => setCourts((prev) => prev.map((c) => c.id === court.id ? { ...c, active: v } : c))}
                    />
                    <span className={`text-xs font-medium ${court.active ? 'text-[#0F6E56]' : 'text-gray-400'}`}>
                      {court.active ? 'Đang hoạt động' : 'Tạm đóng'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditOpen(court)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-[#0F6E56] hover:bg-[#0F6E56]/5 transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Xem lịch"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(court.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Add court */}
        <div className="px-4 py-3 border-t border-gray-100">
          <button className="flex items-center gap-1.5 text-sm text-[#0F6E56] font-semibold hover:underline">
            <Plus className="w-4 h-4" />
            Thêm sân
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {editingCourt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEditingCourt(null)} />
          <div className="relative bg-white rounded-2xl w-full max-w-[480px] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold font-lexend text-gray-900">Chỉnh sửa {editingCourt.name}</h2>
              <button onClick={() => setEditingCourt(null)} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên sân</label>
                <input
                  value={editForm.name ?? ''}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#0F6E56] focus:ring-1 focus:ring-[#0F6E56]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại sàn</label>
                <select
                  value={editForm.floorType ?? ''}
                  onChange={(e) => setEditForm((f) => ({ ...f, floorType: e.target.value as Court['floorType'] }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#0F6E56] focus:ring-1 focus:ring-[#0F6E56]"
                >
                  <option value="Gỗ">Gỗ</option>
                  <option value="Cao su">Cao su</option>
                  <option value="Nhựa">Nhựa</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <div className="flex items-center gap-3 pt-1">
                  <ToggleSwitch
                    checked={editForm.active ?? false}
                    onChange={(v) => setEditForm((f) => ({ ...f, active: v }))}
                  />
                  <span className="text-sm text-gray-600">{editForm.active ? 'Đang hoạt động' : 'Tạm đóng'}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá giờ thường</label>
                  <input
                    type="number"
                    value={editForm.priceNormal ?? 0}
                    onChange={(e) => setEditForm((f) => ({ ...f, priceNormal: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#0F6E56] focus:ring-1 focus:ring-[#0F6E56]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá giờ cao điểm</label>
                  <input
                    type="number"
                    value={editForm.pricePeak ?? 0}
                    onChange={(e) => setEditForm((f) => ({ ...f, pricePeak: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#0F6E56] focus:ring-1 focus:ring-[#0F6E56]"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400 -mt-1">
                Giờ cao điểm: 6–8h sáng / 17–21h tối
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả sân</label>
                <textarea
                  rows={3}
                  placeholder="VD: Sân rộng, có mái che, nằm tầng 2..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#0F6E56] focus:ring-1 focus:ring-[#0F6E56] resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ảnh sân</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-[#0F6E56] transition-colors">
                  <p className="text-sm text-gray-400">Kéo thả hoặc nhấn để tải ảnh lên</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-5 py-4 border-t border-gray-100">
              <button
                onClick={() => setEditingCourt(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleEditSave}
                className="flex-1 px-4 py-2.5 bg-[#0F6E56] hover:bg-[#085041] text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl w-full max-w-sm overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="font-bold font-lexend text-gray-900 mb-1">Xóa sân?</h3>
              <p className="text-sm text-gray-500">Hành động này không thể hoàn tác.</p>
            </div>
            <div className="flex gap-3 p-4 border-t border-gray-100">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
