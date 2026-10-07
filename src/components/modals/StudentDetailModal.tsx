import React from 'react';
import { UserCheck, DollarSign, Bell, Mail, Phone, BookOpen, Award, CheckCircle2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useERP } from '../../hooks/useERP';

export const StudentDetailModal: React.FC = () => {
  const {
    activeModal,
    selectedStudent,
    closeModal,
    openCollectFeeModal,
    sendReminder,
    transactions,
    openReceiptModal,
  } = useERP();

  if (activeModal !== 'studentDetail' || !selectedStudent) return null;

  const student = selectedStudent;
  const studentTxns = transactions.filter(
    (t) => t.rollNo.toLowerCase() === student.rollNo.toLowerCase() || t.studentName === student.name
  );

  return (
    <Modal isOpen={true} onClose={closeModal} title="Student Academic & Financial File" maxWidth="lg">
      <div className="space-y-6 text-left">
        {/* Student Profile Header */}
        <div className="p-4 bg-slate-900 text-white rounded-xl flex flex-wrap items-center justify-between gap-4 border border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-500 to-indigo-500 text-white font-black text-xl flex items-center justify-center shadow-lg">
              {student.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-white tracking-tight">{student.name}</h3>
                <Badge variant="success" className="text-[10px]">
                  {student.status}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Roll No: {student.rollNo} • {student.department}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-right">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">CGPA Score</span>
              <p className="text-lg font-black text-amber-400 font-mono">{student.cgpa.toFixed(2)}</p>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Current Term</span>
              <p className="text-xs font-bold text-slate-200">{student.semester}</p>
            </div>
          </div>
        </div>

        {/* Contact & Academic Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-3">
            <Mail className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-medium text-slate-700 truncate">{student.email}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-3">
            <Phone className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-medium text-slate-700">{student.phone}</span>
          </div>
        </div>

        {/* Financial Summary Ledger */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl">
            <span className="text-xs font-bold text-emerald-800 uppercase">Total Fees Paid</span>
            <h4 className="text-xl font-black text-emerald-900 font-mono mt-1">
              ₹{student.totalPaid.toLocaleString('en-IN')}
            </h4>
          </div>
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl">
            <span className="text-xs font-bold text-amber-800 uppercase">Outstanding Dues</span>
            <h4 className="text-xl font-black text-amber-900 font-mono mt-1">
              ₹{student.totalDues.toLocaleString('en-IN')}
            </h4>
          </div>
        </div>

        {/* History of Transactions Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
          <div className="p-3 bg-slate-100 font-bold text-slate-700 border-b border-slate-200 flex items-center justify-between">
            <span>Payment History & Receipts ({studentTxns.length})</span>
            <span className="text-[10px] text-slate-500 font-normal">Click receipt to inspect</span>
          </div>

          {studentTxns.length === 0 ? (
            <p className="p-4 text-slate-400 text-center">No recorded transactions for this student.</p>
          ) : (
            <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
              {studentTxns.map((t) => (
                <div key={t.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                  <div>
                    <span className="font-mono font-bold text-brand-700">{t.transactionId}</span>
                    <p className="text-[11px] text-slate-500">{t.date} • {t.paymentMode}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-900">₹{t.amount.toLocaleString('en-IN')}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openReceiptModal(t)}
                      className="text-[11px] py-0.5 px-2"
                    >
                      Receipt
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Button
            variant="outline"
            icon={<Bell className="w-4 h-4 text-amber-600" />}
            onClick={() => sendReminder(student.name, student.rollNo)}
          >
            Send Fee Reminder
          </Button>
          <Button
            variant="primary"
            icon={<DollarSign className="w-4 h-4" />}
            onClick={() => {
              closeModal();
              openCollectFeeModal();
            }}
          >
            Collect Tuition Fee
          </Button>
        </div>
      </div>
    </Modal>
  );
};
