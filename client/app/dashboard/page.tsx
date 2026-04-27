'use client';

import { useAuth } from '@/context/auth-context';
import { DashboardNavbar } from '@/components/dashboard/navbar';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return null;
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
