'use client';

import { useState } from 'react';
import { Save, Upload, Camera } from 'lucide-react';

export default function OwnerSettingsPage() {
  const [profile, setProfile] = useState({
    name: 'Trần Nam',
    email: 'trannam@example.com',
    phone: '0901 234 567',
    venueName: 'Sân Cầu Lông Hưng Dũng',
    address: '123 Đường ABC, Quận XYZ, TP. HCM',
    openTime: '06:00',
    closeTime: '22:00',
  });

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold font-lexend text-[#085041]">Cài đặt</h1>
        <p className="text-sm text-gray-400 mt-0.5">Quản lý thông tin và cấu hình sân của bạn</p>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold font-lexend text-gray-800">Thông tin cá nhân</h2>
        </div>
        <div className="p-5 space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#D4FF00] flex items-center justify-center">
              <span className="text-[#085041] font-bold text-xl">TN</span>
            </div>
            <div>
              <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                <Upload className="w-3.5 h-3.5" />
                Đổi ảnh
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên</label>
              <input
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#0F6E56]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#0F6E56]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <input
                value={profile.phone}
                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#0F6E56]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Venue info */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold font-lexend text-gray-800">Thông tin sân</h2>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên cơ sở</label>
            <input
              value={profile.venueName}
              onChange={(e) => setProfile((p) => ({ ...p, venueName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#0F6E56]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
            <input
              value={profile.address}
              onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#0F6E56]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giờ mở cửa</label>
              <input
                type="time"
                value={profile.openTime}
                onChange={(e) => setProfile((p) => ({ ...p, openTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#0F6E56]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giờ đóng cửa</label>
              <input
                type="time"
                value={profile.closeTime}
                onChange={(e) => setProfile((p) => ({ ...p, closeTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#0F6E56]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#0F6E56] hover:bg-[#085041] text-white font-semibold rounded-lg transition-colors">
          <Save className="w-4 h-4" />
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
}
