'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { DashboardNavbar } from '@/components/dashboard/navbar';

export default function DashboardPage() {
  const { user, isLoading, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to be initialized, then check user
    if (isInitialized && !user) {
      router.replace('/login');
    }
  }, [isInitialized, user, router]);

  if (isLoading || !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#2d6a4f] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Welcome, {user?.name || user?.email}!</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-lg font-medium">{user?.email}</p>
            </div>
            {user?.name && (
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="text-lg font-medium">{user.name}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">User ID</p>
              <p className="text-lg font-medium font-mono">{user?.id}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
