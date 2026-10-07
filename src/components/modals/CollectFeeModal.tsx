import React, { useState } from 'react';
import { DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { useERP } from '../../hooks/useERP';
import { PaymentMode } from '../../types/erp';

export const CollectFeeModal: React.FC = () => {
  const { activeModal, closeModal, collectFee } = useERP();

  const [studentName, setStudentName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [department, setDepartment] = useState('Computer Science & Eng.');
  const [amount, setAmount] = useState('45000');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI Gateway');
  const [notes, setNotes] = useState('Semester 5 Tuition & Institutional Facilities Fee');

  if (activeModal !== 'collectFee') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !rollNo || !amount) return;

    collectFee({
      studentName,
      rollNo,
      department,
      amount: parseFloat(amount) || 0,
      paymentMode,
      notes,
    });

    // Reset form fields
    setStudentName('');
    setRollNo('');
  };

  return (
    <Modal isOpen={true} onClose={closeModal} title="Collect Student Tuition Fee" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div className="p-3 bg-brand-50 border border-brand-200 rounded-lg text-xs text-brand-900 flex items-start gap-2.5">
          <DollarSign className="w-4 h-4 text-brand-600 mt-0.5 shrink-0" />
          <p>
            Official institutional fee collection portal. Submitting generates a verified digital receipt and posts to student account ledger immediately.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Student Full Name *"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="e.g. Ananya Sharma"
            required
          />

          <Input
            label="Roll Number / Student ID *"
            value={rollNo}
            onChange={(e) => setRollNo(e.target.value)}
            placeholder="e.g. 2024CS089"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Academic Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            options={[
              { label: 'Computer Science & Eng.', value: 'Computer Science & Eng.' },
              { label: 'Electronics & Comm.', value: 'Electronics & Comm.' },
              { label: 'Mechanical Engineering', value: 'Mechanical Engineering' },
              { label: 'Civil Engineering', value: 'Civil Engineering' },
              { label: 'Information Technology', value: 'Information Technology' },
            ]}
          />

          <Input
            label="Amount (INR ₹) *"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="45000"
            required
          />
        </div>

        <Select
          label="Payment Gateway / Mode"
          value={paymentMode}
          onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
          options={[
            { label: 'UPI Gateway (PhonePe/GooglePay/Paytm)', value: 'UPI Gateway' },
            { label: 'Net Banking (NEFT/RTGS/IMPS)', value: 'Net Banking' },
            { label: 'Credit / Debit Card', value: 'Credit Card' },
            { label: 'Demand Draft (DD)', value: 'Demand Draft' },
            { label: 'Cash Collection Counter', value: 'Cash' },
          ]}
        />

        <Textarea
          label="Ledger Entry Notes / Remark"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Add optional notes..."
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Button type="button" variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" icon={<CheckCircle2 className="w-4 h-4" />}>
            Confirm Fee Collection
          </Button>
        </div>
      </form>
    </Modal>
  );
};
