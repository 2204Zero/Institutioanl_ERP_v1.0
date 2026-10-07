import React, { useState } from 'react';
import { RotateCcw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { useERP } from '../../hooks/useERP';

export const RefundModal: React.FC = () => {
  const { activeModal, selectedTransaction, closeModal, approveRefund, rejectRefund } = useERP();
  const [reason, setReason] = useState('Duplicate payment initiated via net banking gateway.');

  if (activeModal !== 'refund' || !selectedTransaction) return null;

  const txn = selectedTransaction;

  return (
    <Modal isOpen={true} onClose={closeModal} title="Authorize Tuition Fee Refund" maxWidth="md">
      <div className="space-y-4 text-left">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <p>
            Warning: Approving a refund will initiate financial gateway reversal and update student account ledger status to <span className="font-bold">Refunded</span>.
          </p>
        </div>

        {/* Transaction Summary Card */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Transaction ID:</span>
            <span className="font-mono font-bold text-brand-700">{txn.transactionId}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Student Name:</span>
            <span className="font-bold text-slate-900">{txn.studentName} ({txn.rollNo})</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Original Amount Paid:</span>
            <span className="font-mono font-extrabold text-slate-900">₹{txn.amount.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Payment Gateway:</span>
            <span className="font-medium text-slate-800">{txn.paymentMode}</span>
          </div>
        </div>

        <Textarea
          label="Refund Justification & Compliance Notes *"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Enter reason for refund..."
          required
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Button
            type="button"
            variant="outline"
            icon={<XCircle className="w-4 h-4 text-rose-600" />}
            onClick={() => rejectRefund(txn.transactionId)}
            className="border-rose-200 text-rose-700 hover:bg-rose-50"
          >
            Reject Refund
          </Button>

          <Button
            type="button"
            variant="primary"
            icon={<CheckCircle className="w-4 h-4" />}
            onClick={() => approveRefund(txn.transactionId)}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Approve & Authorize Refund
          </Button>
        </div>
      </div>
    </Modal>
  );
};
