'use client';

import { signOut, useSession } from 'next-auth/react';

export function DashboardNavbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold">Zen8labs</h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">{session?.user?.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
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
