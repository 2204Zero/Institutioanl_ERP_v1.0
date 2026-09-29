import React from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useERP } from '../../hooks/useERP';
import { logBackendAction } from '../../utils/backendLogger';
import { Users, DollarSign, CheckCircle2, Award, Calendar, Bell, MessageSquare, ShieldCheck } from 'lucide-react';

export const ParentDashboard: React.FC = () => {
  const { openCollectFeeModal, addToast } = useERP();

  const handlePayFee = () => {
    logBackendAction(
      'Initiated Parent Online UPI Tuition Fee Payment Portal Gateway',
      '/api/v1/finance/parent/pay-fee',
      'POST',
      200,
      'parent.sharma'
    );
    openCollectFeeModal();
  };

  return (
    <AppLayout>
      <div className="space-y-6 text-left">
        {/* Ward Header */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white shadow-xl shadow-emerald-900/20 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-black text-xl text-white">
              VS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight">Parent Portal: Mr. Vijay Sharma</h1>
                <Badge variant="success" className="bg-emerald-500/20 text-emerald-100 border-emerald-400/30">
                  Verified Guardian
                </Badge>
              </div>
              <p className="text-xs text-emerald-100 mt-1">
                Ward Name: <span className="font-bold text-white">Aarav Sharma</span> (Roll: <span className="font-mono font-bold">2024CS108</span>) • Semester 5 Computer Science
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" onClick={handlePayFee}>
              <DollarSign className="w-4 h-4 mr-1.5" /> Pay Tuition / Dues
            </Button>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 border-l-4 border-l-emerald-600">
            <p className="text-xs font-semibold text-slate-500 uppercase">Ward Cumulative CGPA</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">8.90 / 10</h3>
            <span className="text-[11px] text-emerald-600 font-medium">Excellent Performance</span>
          </Card>
          <Card className="p-4 border-l-4 border-l-brand-600">
            <p className="text-xs font-semibold text-slate-500 uppercase">Biometric Attendance</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">94.8%</h3>
            <span className="text-[11px] text-emerald-600 font-medium">Regular Attendance</span>
          </Card>
          <Card className="p-4 border-l-4 border-l-purple-600">
            <p className="text-xs font-semibold text-slate-500 uppercase">Fee Paid (Sem 5)</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹ 85,000</h3>
            <span className="text-[11px] text-emerald-600 font-medium">Receipt Issued #89012</span>
          </Card>
          <Card className="p-4 border-l-4 border-l-amber-500">
            <p className="text-xs font-semibold text-slate-500 uppercase">Hostel & Mess Status</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">Block A - Room 101</h3>
            <span className="text-[11px] text-amber-600 font-medium">Mess Pass Cleared</span>
          </Card>
        </div>

        {/* Ward Reports & Notice Board */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <Award className="w-4 h-4 text-emerald-600" /> Ward Examination Breakdown
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">Database Systems (CS301)</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Mid-Sem: 28/30 • End-Sem: 64/70</p>
                </div>
                <Badge variant="purple">Grade: A+</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">Distributed Systems (CS304)</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Mid-Sem: 26/30 • End-Sem: 60/70</p>
                </div>
                <Badge variant="purple">Grade: A</Badge>
              </div>
            </div>
          </Card>

          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <Bell className="w-4 h-4 text-brand-600" /> Institutional Guardian Notices
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-sky-50/50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60">
                <span className="font-bold text-sky-900 dark:text-sky-200">Parent-Teacher Meeting (PTM) Scheduled</span>
                <p className="text-[11px] text-sky-700 dark:text-sky-300 mt-1">
                  Annual semester progress review scheduled for October 15, 2026 at 10:00 AM via Hybrid Zoom/Campus.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
                <span className="font-bold text-emerald-900 dark:text-emerald-200">Semester Fee Clearances Confirmed</span>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-1">
                  Tuition and hostel fee receipt #89012 has been verified by the accounts office.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};
