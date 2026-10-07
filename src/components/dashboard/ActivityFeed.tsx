import React from 'react';
import { Activity, CheckCircle2, Clock, FileText } from 'lucide-react';
import { Card } from '../ui/Card';
import { useERP } from '../../hooks/useERP';

export const ActivityFeed: React.FC = () => {
  const { transactions } = useERP();

  const recentTxns = transactions.slice(0, 4);

  return (
    <Card className="flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-brand-600" />
          <h3 className="text-sm font-bold text-slate-800">Recent Institutional Activity</h3>
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase">Live Feed</span>
      </div>

      <div className="space-y-3 my-3">
        {recentTxns.map((t) => (
          <div key={t.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100/80">
            <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200 mt-0.5 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-bold text-slate-800 truncate">
                {t.studentName} paid ₹{t.amount.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                {t.transactionId} • {t.paymentMode}
              </p>
            </div>
            <span className="text-[10px] text-slate-400 font-medium shrink-0">{t.date.slice(11)}</span>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-slate-100 text-center">
        <span className="text-[11px] font-semibold text-brand-600 cursor-pointer hover:underline">
          View Audit Logs →
        </span>
      </div>
    </Card>
  );
};
