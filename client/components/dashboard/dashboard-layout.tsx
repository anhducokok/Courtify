'use client';

import { ReactNode } from 'react';
import { AdminSidebar } from './admin-sidebar';
import { DashboardHeader } from './dashboard-header';

interface DashboardLayoutProps {
  children: ReactNode;
  isAdmin?: boolean;
  headerTitle?: string;
  headerSubtitle?: string;
}

export function DashboardLayout({
  children,
  isAdmin = true,
  headerTitle,
  headerSubtitle,
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar isAdmin={isAdmin} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader title={headerTitle} subtitle={headerSubtitle} />

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
