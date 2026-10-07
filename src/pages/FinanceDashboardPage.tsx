import React, { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { QuickActions } from '../components/dashboard/QuickActions';
import { MetricCards } from '../components/dashboard/MetricCards';
import { RevenueCharts } from '../components/dashboard/RevenueCharts';
import { TransactionsTable } from '../components/dashboard/TransactionsTable';
import { ActivityFeed } from '../components/dashboard/ActivityFeed';
import { CalendarWidget } from '../components/dashboard/CalendarWidget';
import { CollectFeeModal } from '../components/modals/CollectFeeModal';
import { ReceiptModal } from '../components/modals/ReceiptModal';
import { StudentDetailModal } from '../components/modals/StudentDetailModal';
import { TeacherDetailModal } from '../components/modals/TeacherDetailModal';
import { RefundModal } from '../components/modals/RefundModal';
import { SettingsModal } from '../components/modals/SettingsModal';
import { ConfirmDialog } from '../components/modals/ConfirmDialog';
import { Select } from '../components/ui/Select';
import { useERP } from '../hooks/useERP';

export const FinanceDashboardPage: React.FC = () => {
  const [selectedTerm, setSelectedTerm] = useState('Sem5-2026');
  const [statusFilterOverride, setStatusFilterOverride] = useState<string | undefined>(undefined);

  return (
    <AppLayout>
      <div className="space-y-6 text-left">
        {/* Top Header Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Institutional Finance & Operations Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Real-time monitoring of tuition collections, fee ledgers, staff payroll & audit controls.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Select
              value={selectedTerm}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedTerm(e.target.value)}
              options={[
                { label: 'Semester 5 (2026-27)', value: 'Sem5-2026' },
                { label: 'Semester 4 (2025-26)', value: 'Sem4-2025' },
              ]}
              className="w-44 text-xs py-1.5"
            />
          </div>
        </div>

        {/* Quick Operations Action Bar */}
        <QuickActions />

        {/* 1. Metric Summary Cards Grid */}
        <MetricCards onSelectFilter={(status: string) => setStatusFilterOverride(status)} />

        {/* 2. Interactive Recharts Visualizations */}
        <RevenueCharts />

        {/* 3. Activity & Calendar Side-by-Side Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActivityFeed />
          <CalendarWidget />
        </div>

        {/* 4. Production Transactions Data Table Grid */}
        <TransactionsTable statusFilterOverride={statusFilterOverride} />
      </div>

      {/* Global Modals Mounted */}
      <CollectFeeModal />
      <ReceiptModal />
      <StudentDetailModal />
      <TeacherDetailModal />
      <RefundModal />
      <SettingsModal />
      <ConfirmDialog />
    </AppLayout>
  );
};
