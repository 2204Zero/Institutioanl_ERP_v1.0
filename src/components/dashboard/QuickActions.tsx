import React from 'react';
import { Plus, Download, Printer, RefreshCw, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useERP } from '../../hooks/useERP';

export const QuickActions: React.FC = () => {
  const { openCollectFeeModal, exportTransactionsCSV, addToast } = useERP();

  return (
    <Card className="mb-6 bg-gradient-to-r from-brand-600 via-brand-700 to-indigo-800 text-white border-0 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black tracking-tight">Enterprise Finance Operations Hub</h2>
          <p className="text-xs text-brand-100 mt-0.5">
            Instant operations for student fee collection, receipts, ledger audit & refund authorizations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            icon={<Plus className="w-4 h-4 text-brand-600" />}
            onClick={openCollectFeeModal}
            className="bg-white text-brand-700 hover:bg-brand-50 border-0 font-bold"
          >
            Collect Fee
          </Button>

          <Button
            variant="outline"
            icon={<Download className="w-4 h-4 text-white" />}
            onClick={exportTransactionsCSV}
            className="border-white/30 text-white hover:bg-white/10"
          >
            Export Ledger
          </Button>

          <Button
            variant="outline"
            icon={<Printer className="w-4 h-4 text-white" />}
            onClick={() => window.print()}
            className="border-white/30 text-white hover:bg-white/10"
          >
            Print Summary
          </Button>

          <Button
            variant="ghost"
            icon={<RefreshCw className="w-4 h-4 text-white" />}
            onClick={() => addToast('Gateway Synced', 'Refreshed banking gateway authorization codes.', 'info')}
            className="text-white hover:bg-white/10"
          >
            Sync Banking API
          </Button>
        </div>
      </div>
    </Card>
  );
};
