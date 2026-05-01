'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

export function DashboardNavbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold">Zen8labs</h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">{user?.email}</span>
            <button
              onClick={() => logout().then(() => router.push('/login'))}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
