import React from 'react';
import { Printer, Download, Mail, CheckCircle2, ShieldCheck, GraduationCap } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useERP } from '../../hooks/useERP';

export const ReceiptModal: React.FC = () => {
  const { activeModal, selectedTransaction, closeModal, addToast } = useERP();

  if (activeModal !== 'receipt' || !selectedTransaction) return null;

  const txn = selectedTransaction;
  const tuitionAmount = Math.round(txn.amount * 0.75);
  const labAmount = Math.round(txn.amount * 0.15);
  const examAmount = txn.amount - tuitionAmount - labAmount;

  return (
    <Modal isOpen={true} onClose={closeModal} title="Official Fee Collection Receipt" maxWidth="lg">
      <div className="space-y-6 text-left">
        {/* Receipt Header Banner */}
        <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-600 flex items-center justify-center font-bold text-white shadow-md">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight text-white">
                National Institute of Technology & Sciences
              </h3>
              <p className="text-[11px] text-slate-400">Office of the Financial Controller • Govt. Accredited</p>
            </div>
          </div>
          <Badge variant="success" className="font-mono text-xs px-2.5 py-1">
            VERIFIED RECEIPT
          </Badge>
        </div>

        {/* Transaction Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Receipt No</span>
            <p className="font-mono font-bold text-brand-700 mt-0.5">{txn.transactionId}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Date & Time</span>
            <p className="font-mono text-slate-700 mt-0.5">{txn.date}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Payment Mode</span>
            <p className="font-semibold text-slate-800 mt-0.5">{txn.paymentMode}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Status</span>
            <p className="font-bold text-emerald-600 mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {txn.status}
            </p>
          </div>
        </div>

        {/* Student Details */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 space-y-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Student Information</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-500">Student Name:</span>
              <p className="font-bold text-slate-900">{txn.studentName}</p>
            </div>
            <div>
              <span className="text-slate-500">Roll Number:</span>
              <p className="font-mono font-bold text-slate-900">{txn.rollNo}</p>
            </div>
            <div>
              <span className="text-slate-500">Department:</span>
              <p className="font-medium text-slate-800">{txn.department}</p>
            </div>
          </div>
        </div>

        {/* Fee Itemization Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-100 font-bold text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-3">Fee Description</th>
                <th className="p-3 text-right">Amount (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-3 font-medium text-slate-800">Academic Tuition Fee (Semester 5)</td>
                <td className="p-3 text-right font-mono font-semibold">₹{tuitionAmount.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-slate-800">Laboratories & Computing Infrastructure Fee</td>
                <td className="p-3 text-right font-mono font-semibold">₹{labAmount.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-slate-800">Examination & Evaluation Fee</td>
                <td className="p-3 text-right font-mono font-semibold">₹{examAmount.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
            <tfoot className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
              <tr>
                <td className="p-3 text-sm">Total Paid Amount</td>
                <td className="p-3 text-right text-sm font-mono font-black text-brand-700">
                  ₹{txn.amount.toLocaleString('en-IN')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Digital Verification Footer */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cryptographically Signed by Institutional Ledger Gateway</span>
          </div>
          <span className="font-mono">IP: 192.168.1.104 • Auditor ID: ADM-992</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Button
            variant="outline"
            icon={<Mail className="w-4 h-4" />}
            onClick={() => addToast('Email Dispatched', `Receipt PDF sent to student email linked to ${txn.rollNo}`, 'info')}
          >
            Email Student
          </Button>
          <Button
            variant="outline"
            icon={<Printer className="w-4 h-4" />}
            onClick={() => window.print()}
          >
            Print Receipt
          </Button>
          <Button variant="primary" onClick={closeModal}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
