import { Metadata } from 'next';
import { MyBookingsClient } from './MyBookingsClient';

export const metadata: Metadata = {
  title: 'Sân Đã Đặt | Courtify',
  description: 'Quản lý lịch đặt sân của bạn',
};

export default function MyBookingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 flex flex-col">
        <MyBookingsClient />
      </main>
    </div>
  );
}
