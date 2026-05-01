'use client';

import { ReactNode } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardLayout isAdmin={true} headerTitle="Quản trị">
      {children}
    </DashboardLayout>
  );
}
