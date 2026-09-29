import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  MoreVertical,
  FileText,
  UserCheck,
  RefreshCw,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { useERP } from '../../hooks/useERP';
import { Transaction } from '../../types/erp';
import { motion, AnimatePresence } from 'framer-motion';

interface TransactionsTableProps {
  statusFilterOverride?: string;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({ statusFilterOverride }) => {
  const {
    transactions,
    openReceiptModal,
    openStudentDetailModal,
    openRefundModal,
    deleteTransaction,
    exportTransactionsCSV,
    addToast,
  } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(statusFilterOverride || 'All');
  const [paymentModeFilter, setPaymentModeFilter] = useState<string>('All');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // React to statusFilterOverride prop when card clicked
  React.useEffect(() => {
    if (statusFilterOverride) {
      setStatusFilter(statusFilterOverride);
    }
  }, [statusFilterOverride]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        t.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.rollNo.toLowerCase().includes(queryOrEmpty(searchTerm)) ||
        t.transactionId.toLowerCase().includes(queryOrEmpty(searchTerm)) ||
        t.department.toLowerCase().includes(queryOrEmpty(searchTerm));

      const matchesStatus = statusFilter === 'All' ? true : t.status === statusFilter;
      const matchesMode = paymentModeFilter === 'All' ? true : t.paymentMode === paymentModeFilter;

      return matchesSearch && matchesStatus && matchesMode;
    });
  }, [transactions, searchTerm, statusFilter, paymentModeFilter]);

  function queryOrEmpty(val: string) {
    return val.toLowerCase();
  }

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'Paid':
        return (
          <Badge variant="success" className="flex items-center gap-1 font-semibold">
            <CheckCircle className="w-3 h-3" /> Paid
          </Badge>
        );
      case 'Pending':
        return (
          <Badge variant="warning" className="flex items-center gap-1 font-semibold">
            <Clock className="w-3 h-3" /> Pending
          </Badge>
        );
      case 'Refunded':
        return (
          <Badge variant="purple" className="flex items-center gap-1 font-semibold">
            <RotateCcw className="w-3 h-3" /> Refunded
          </Badge>
        );
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <Card className="flex flex-col justify-between overflow-hidden p-0 border border-slate-200/80 shadow-xs">
      {/* Filter & Action Header */}
      <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-left">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
            Institutional Fee Ledger Transactions
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Showing {filteredTransactions.length} recorded payments, online gateway receipts & refunds.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Table Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search student, roll, txn ID..."
              className="bg-white border border-slate-300 text-slate-900 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-brand-500 w-52 placeholder:text-slate-400 font-medium"
            />
          </div>

          {/* Status Filter Dropdown */}
          <Select
            value={statusFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { label: 'All Statuses', value: 'All' },
              { label: 'Paid Only', value: 'Paid' },
              { label: 'Pending Only', value: 'Pending' },
              { label: 'Refunded Only', value: 'Refunded' },
            ]}
            className="text-xs py-1.5 w-32"
          />

          {/* Payment Mode Filter Dropdown */}
          <Select
            value={paymentModeFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setPaymentModeFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { label: 'All Modes', value: 'All' },
              { label: 'UPI Gateway', value: 'UPI Gateway' },
              { label: 'Net Banking', value: 'Net Banking' },
              { label: 'Credit Card', value: 'Credit Card' },
              { label: 'Demand Draft', value: 'Demand Draft' },
              { label: 'Cash', value: 'Cash' },
            ]}
            className="text-xs py-1.5 w-32"
          />

          {/* CSV Export Button */}
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-3.5 h-3.5 text-slate-600" />}
            onClick={exportTransactionsCSV}
            className="text-xs"
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Transaction ID</th>
              <th className="py-3 px-4">Student & Roll No</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Payment Mode</th>
              <th className="py-3 px-4">Date & Time</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs">
            {paginatedTransactions.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                  No matching transaction records found.
                </td>
              </tr>
            ) : (
              paginatedTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="py-3 px-4 font-mono font-bold text-brand-700">{t.transactionId}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => openStudentDetailModal(t.rollNo)}
                      className="text-left font-bold text-slate-900 hover:text-brand-600 hover:underline transition-colors block"
                    >
                      {t.studentName}
                    </button>
                    <span className="text-[10px] font-mono text-slate-400 font-semibold">{t.rollNo}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">{t.department}</td>
                  <td className="py-3 px-4 font-mono font-extrabold text-slate-900">
                    ₹{t.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">{t.paymentMode}</td>
                  <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{t.date}</td>
                  <td className="py-3 px-4">{getStatusBadge(t.status)}</td>
                  <td className="py-3 px-4 text-right relative">
                    <div className="flex items-center justify-end gap-1">
                      {/* View Receipt Quick Action */}
                      <button
                        onClick={() => openReceiptModal(t)}
                        className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
                        title="View Official Receipt"
                      >
                        <FileText className="w-4 h-4" />
                      </button>

                      {/* Menu Popover */}
                      <div className="relative">
                        <button
                          onClick={() => setActiveMenuId((prev) => (prev === t.id ? null : t.id))}
                          className="p-1.5 text-slate-400 hover:text-slate-800 rounded-md transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        <AnimatePresence>
                          {activeMenuId === t.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-30 text-left"
                            >
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  openReceiptModal(t);
                                }}
                                className="w-full px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                              >
                                <FileText className="w-3.5 h-3.5 text-brand-600" />
                                View Receipt
                              </button>
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  openStudentDetailModal(t.rollNo);
                                }}
                                className="w-full px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                              >
                                <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                                Student Profile
                              </button>
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  openRefundModal(t);
                                }}
                                className="w-full px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                              >
                                <RefreshCw className="w-3.5 h-3.5 text-purple-600" />
                                Initiate Refund
                              </button>
                              <div className="border-t border-slate-100 my-1" />
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  deleteTransaction(t.id);
                                }}
                                className="w-full px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-bold"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                Delete Transaction
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
        <div>
          Page <span className="font-bold text-slate-900">{currentPage}</span> of{' '}
          <span className="font-bold text-slate-900">{totalPages}</span> ({filteredTransactions.length} records total)
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="p-1 px-2 text-xs"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            className="p-1 px-2 text-xs"
          >
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
