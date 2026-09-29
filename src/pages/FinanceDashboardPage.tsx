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
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { FinanceService, logFinanceAction } from '../services/financeService';
import {
  DollarSign,
  FileText,
  CreditCard,
  Award,
  BookOpen,
  Users,
  PieChart,
  Download,
  Plus,
  CheckCircle,
  XCircle,
  QrCode,
  ShieldCheck,
  Building,
  RefreshCw,
} from 'lucide-react';
import { useERP } from '../hooks/useERP';

type FinanceTab =
  | 'overview'
  | 'fee-structures'
  | 'billing-invoices'
  | 'scholarships'
  | 'accounting'
  | 'parent-portal'
  | 'bi-reports';

export const FinanceDashboardPage: React.FC = () => {
  const { addToast } = useERP();
  const [activeTab, setActiveTab] = useState<FinanceTab>('overview');
  const [selectedTerm, setSelectedTerm] = useState('Sem5-2026');
  const [statusFilterOverride, setStatusFilterOverride] = useState<string | undefined>(undefined);

  // Phase 6 Finance Service Datasets
  const kpis = FinanceService.getKPIs();
  const feeStructures = FinanceService.getFeeStructures();
  const invoices = FinanceService.getInvoices();
  const payments = FinanceService.getPayments();
  const scholarships = FinanceService.getScholarships();
  const accounts = FinanceService.getAccounts();
  const trialBalance = FinanceService.getTrialBalance();
  const parentSummary = FinanceService.getParentFinanceSummary('2024CS108');

  // Quick Inline State for Gateways & Invoices
  const [payModalInvoice, setPayModalInvoice] = useState<string | null>(null);
  const [selectedGateway, setSelectedGateway] = useState<'RAZORPAY' | 'STRIPE' | 'UPI'>('RAZORPAY');

  const handleOnlinePayment = (invNum: string, amount: number) => {
    FinanceService.processPayment({
      invoiceNumber: invNum,
      studentName: parentSummary.studentName,
      rollNo: parentSummary.rollNo,
      amount,
      method: selectedGateway,
      parentRole: true,
    });
    addToast(
      'Payment Successful!',
      `₹${amount.toLocaleString('en-IN')} paid via ${selectedGateway} gateway for Invoice #${invNum}`,
      'success'
    );
    setPayModalInvoice(null);
  };

  const handleApproveScholarship = (id: string) => {
    FinanceService.updateScholarshipStatus(id, 'APPROVED', 'Dr. Rajesh Kumar (Dean)');
    addToast('Scholarship Approved!', 'Grant credited to student fee ledger.', 'success');
  };

  return (
    <AppLayout>
      <div className="space-y-6 text-left">
        {/* Top Header & Sub-system Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <DollarSign className="w-7 h-7 text-emerald-600" />
              Enterprise University Finance & Accounting Suite
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Phase 6 — Fee Engine, Invoicing, Scholarships, Double-Entry Accounting, Parent Portal & BI Reports.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Select
              value={selectedTerm}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedTerm(e.target.value)}
              options={[
                { label: 'Academic Session 2026-27 (Sem 5)', value: 'Sem5-2026' },
                { label: 'Academic Session 2025-26 (Sem 4)', value: 'Sem4-2025' },
              ]}
              className="w-52 text-xs py-1.5"
            />
          </div>
        </div>

        {/* Phase 6 Enterprise Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-200">
          {[
            { id: 'overview', label: 'Executive Overview', icon: <PieChart className="w-4 h-4" /> },
            { id: 'fee-structures', label: 'Fee Structures', icon: <Building className="w-4 h-4" /> },
            { id: 'billing-invoices', label: 'Student Invoices', icon: <FileText className="w-4 h-4" /> },
            { id: 'scholarships', label: 'Scholarships & Aid', icon: <Award className="w-4 h-4" /> },
            { id: 'accounting', label: 'General Ledger', icon: <BookOpen className="w-4 h-4" /> },
            { id: 'parent-portal', label: 'Parent Portal View', icon: <Users className="w-4 h-4" /> },
            { id: 'bi-reports', label: 'BI Reports & Audit', icon: <Download className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as FinanceTab)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: EXECUTIVE OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <QuickActions />
            <MetricCards onSelectFilter={(status: string) => setStatusFilterOverride(status)} />
            <RevenueCharts />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ActivityFeed />
              <CalendarWidget />
            </div>
            <TransactionsTable statusFilterOverride={statusFilterOverride} />
          </div>
        )}

        {/* TAB 2: FEE STRUCTURE MANAGEMENT */}
        {activeTab === 'fee-structures' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Configurable Fee Engine & Templates</h2>
                <p className="text-xs text-slate-500">Program, department and semester-wise fee structures with GST & installment plans.</p>
              </div>
              <Button
                variant="primary"
                className="text-xs"
                onClick={() => {
                  logFinanceAction({
                    user: 'Dr. Rajesh Kumar',
                    role: 'Dean',
                    action: 'Initiated New Fee Template Builder',
                    status: 'SUCCESS',
                  });
                  addToast('Fee Engine Ready', 'Opening Fee Template Creation Wizard...', 'info');
                }}
              >
                <Plus className="w-4 h-4 mr-1" /> Create Fee Template
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {feeStructures.map((fs) => (
                <Card key={fs.id} className="p-5 space-y-4 border border-slate-200 hover:border-brand-300 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200 uppercase tracking-wider">
                        {fs.code}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-1">{fs.name}</h3>
                      <p className="text-xs text-slate-500">{fs.department} • {fs.academicYear}</p>
                    </div>
                    <Badge variant={fs.isFrozen ? 'error' : 'success'}>
                      {fs.isFrozen ? 'FROZEN' : 'ACTIVE v' + fs.revisionVersion}
                    </Badge>
                  </div>

                  <div className="space-y-2 border-t border-b border-slate-100 py-3">
                    {fs.feeItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">{item.name}</span>
                        <span className="font-semibold text-slate-900">₹{item.amount.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 pt-1">
                    <span>Net Payable Amount (incl GST)</span>
                    <span className="text-sm text-emerald-600">₹{fs.netAmount.toLocaleString('en-IN')}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: STUDENT BILLING & INVOICES */}
        {activeTab === 'billing-invoices' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Automated Student Invoices & Receipts</h2>
                <p className="text-xs text-slate-500">Real-time invoice status, QR Code generation, PDF downloads and offline entries.</p>
              </div>
            </div>

            <Card className="p-0 overflow-hidden border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Invoice #</th>
                    <th className="p-3.5">Student Details</th>
                    <th className="p-3.5">Total Bill</th>
                    <th className="p-3.5">Paid</th>
                    <th className="p-3.5">Balance Due</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-bold text-brand-600">{inv.invoiceNumber}</td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-900">{inv.studentName}</div>
                        <div className="text-[11px] text-slate-500">{inv.rollNo} • {inv.department}</div>
                      </td>
                      <td className="p-3.5 font-medium">₹{inv.totalAmount.toLocaleString('en-IN')}</td>
                      <td className="p-3.5 text-emerald-600 font-medium">₹{inv.paidAmount.toLocaleString('en-IN')}</td>
                      <td className="p-3.5 text-rose-600 font-bold">₹{inv.balanceDue.toLocaleString('en-IN')}</td>
                      <td className="p-3.5">
                        <Badge variant={inv.status === 'PAID' ? 'success' : inv.status === 'PARTIAL' ? 'warning' : 'error'}>
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right">
                        <Button
                          variant="secondary"
                          className="text-[11px] py-1 px-2"
                          onClick={() => {
                            logFinanceAction({
                              user: 'Finance Admin',
                              role: 'Admin',
                              action: 'Downloaded Invoice PDF',
                              invoice: inv.invoiceNumber,
                              status: 'SUCCESS',
                            });
                            addToast('Downloading Invoice PDF...', `Invoice #${inv.invoiceNumber} generated.`, 'info');
                          }}
                        >
                          <Download className="w-3.5 h-3.5 mr-1" /> PDF
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* TAB 4: SCHOLARSHIPS & FINANCIAL AID */}
        {activeTab === 'scholarships' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Scholarship & Financial Aid Portal</h2>
                <p className="text-xs text-slate-500">Government, Merit, and Need-based waiver approvals and disbursement records.</p>
              </div>
            </div>

            <div className="space-y-4">
              {scholarships.map((sch) => (
                <Card key={sch.id} className="p-4 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-slate-900">{sch.applicationNumber}</span>
                      <Badge variant="purple">{sch.type}</Badge>
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">{sch.title}</h4>
                    <p className="text-xs text-slate-500">
                      Applicant: <span className="font-semibold text-slate-700">{sch.studentName}</span> ({sch.rollNo}) • Granted: <span className="font-bold text-emerald-600">₹{sch.amountGranted.toLocaleString('en-IN')}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant={sch.status === 'APPROVED' || sch.status === 'DISBURSED' ? 'success' : 'warning'}>
                      {sch.status}
                    </Badge>
                    {sch.status !== 'APPROVED' && sch.status !== 'DISBURSED' && (
                      <Button variant="primary" className="text-xs" onClick={() => handleApproveScholarship(sch.id)}>
                        <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve Grant
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: GENERAL LEDGER & DOUBLE-ENTRY ACCOUNTING */}
        {activeTab === 'accounting' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Chart of Accounts & Trial Balance</h2>
                <p className="text-xs text-slate-500">Double-entry debit/credit ledger, trial balance and financial vouchers.</p>
              </div>
            </div>

            <Card className="p-0 overflow-hidden border border-slate-200">
              <div className="p-3 bg-slate-800 text-white font-bold text-xs">
                Institutional Trial Balance Statement (Current Fiscal Year)
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Account Code</th>
                    <th className="p-3">Account Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3 text-right">Debit Balance (₹)</th>
                    <th className="p-3 text-right">Credit Balance (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {trialBalance.map((tb, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="p-3 font-mono font-bold text-slate-700">{tb.accountCode}</td>
                      <td className="p-3 font-semibold text-slate-900">{tb.accountName}</td>
                      <td className="p-3"><Badge variant="neutral">{tb.accountType}</Badge></td>
                      <td className="p-3 text-right font-medium text-slate-800">
                        {tb.debitBalance ? tb.debitBalance.toLocaleString('en-IN') : '-'}
                      </td>
                      <td className="p-3 text-right font-medium text-slate-800">
                        {tb.creditBalance ? tb.creditBalance.toLocaleString('en-IN') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* TAB 6: PARENT FINANCE PORTAL VIEW */}
        {activeTab === 'parent-portal' && (
          <div className="space-y-6">
            <div className="bg-slate-900 text-white p-5 rounded-xl shadow-lg flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Parent Access Portal</span>
                <h3 className="text-xl font-extrabold mt-0.5">{parentSummary.studentName} ({parentSummary.rollNo})</h3>
                <p className="text-xs text-slate-300">{parentSummary.program} • Guardian: {parentSummary.parentName}</p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400">Total Pending Dues</span>
                <div className="text-2xl font-black text-rose-400">₹{parentSummary.totalPending.toLocaleString('en-IN')}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {parentSummary.activeInvoices.map((inv) => (
                <Card key={inv.id} className="p-5 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{inv.invoiceNumber}</span>
                      <p className="text-xs text-slate-500">Due Date: {inv.dueDate}</p>
                    </div>
                    <Badge variant={inv.status === 'PAID' ? 'success' : 'warning'}>{inv.status}</Badge>
                  </div>

                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg text-xs font-bold text-slate-800">
                    <span>Balance Due</span>
                    <span className="text-sm text-rose-600">₹{inv.balanceDue.toLocaleString('en-IN')}</span>
                  </div>

                  {inv.balanceDue > 0 && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-slate-600 font-semibold">Payment Gateway:</label>
                        <select
                          value={selectedGateway}
                          onChange={(e) => setSelectedGateway(e.target.value as any)}
                          className="text-xs border border-slate-300 rounded px-2 py-1"
                        >
                          <option value="RAZORPAY">Razorpay (UPI / NetBanking)</option>
                          <option value="STRIPE">Stripe (Card / International)</option>
                          <option value="UPI">Direct UPI Intent</option>
                        </select>
                      </div>

                      <Button
                        variant="primary"
                        className="w-full text-xs py-2 bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleOnlinePayment(inv.invoiceNumber, inv.balanceDue)}
                      >
                        <CreditCard className="w-4 h-4 mr-1.5" /> Pay ₹{inv.balanceDue.toLocaleString('en-IN')} Now
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: BI REPORTS & AUDITING */}
        {activeTab === 'bi-reports' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Financial Reports & Terminal Audit Stream</h2>
                <p className="text-xs text-slate-500">Exportable collection ledgers, P&L statements, and real-time backend audit logs.</p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  className="text-xs"
                  onClick={() => {
                    logFinanceAction({
                      user: 'Dr. Rajesh Kumar',
                      role: 'Dean',
                      action: 'Exported Financial Audit Log',
                      status: 'SUCCESS',
                    });
                    addToast('Export Generated', 'Financial Report saved to local downloads.', 'success');
                  }}
                >
                  <Download className="w-4 h-4 mr-1" /> Export CSV / Excel
                </Button>
              </div>
            </div>

            <Card className="p-4 bg-slate-950 text-slate-200 font-mono text-xs rounded-xl space-y-2 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                <span className="font-bold text-emerald-400">Live Spring Boot stdout Audit Stream</span>
                <span>Active Logger: FinanceController</span>
              </div>
              <div className="space-y-1 text-[11px] text-slate-300">
                <p><span className="text-emerald-400">[FINANCE]</span> User: Aarav Sharma | Role: Parent | Action: Fee Payment | Invoice: INV-2026-1042 | Amount: ₹45,000 | Gateway: Razorpay | Status: SUCCESS | Duration: 42ms</p>
                <p><span className="text-emerald-400">[FINANCE]</span> User: Dr. Rajesh Kumar | Role: Dean | Action: Approved Scholarship SCH-2026-041 | Amount: ₹10,000 | Status: SUCCESS | Duration: 28ms</p>
                <p><span className="text-emerald-400">[FINANCE]</span> User: System Engine | Role: Automated Billing | Action: Generated Invoice INV-2026-1043 | Status: SUCCESS | Duration: 18ms</p>
              </div>
            </Card>
          </div>
        )}
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
