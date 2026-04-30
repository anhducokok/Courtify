'use client';

import { ReactNode } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';

export default function ManagerLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardLayout isAdmin={false} headerTitle="Quản lý">
      {children}
    </DashboardLayout>
  );
}
