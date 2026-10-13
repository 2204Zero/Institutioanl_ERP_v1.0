import { useState } from 'react';
import { 
  Search, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  Loader2, 
  TrendingDown, 
  ShieldAlert, 
  ExternalLink 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '../components/ui/input';
import { 
  useFinanceSummary, 
  useAllStudentFees, 
  formatCurrency, 
  parseAmount, 
  type StudentFee 
} from '../hooks/queries/useFinance';
import { useAuthStore } from '../store/useAuthStore';
import { useMyStudentId } from '../hooks/useMyStudentId';
import { StudentFeesTab } from '../components/StudentFeesTab';
import { Skeleton } from '../components/ui/skeleton';
import { Button } from '../components/ui/button';
import { CreateInvoiceDialog } from '../components/CreateInvoiceDialog';
import { RecordPaymentDialog } from '../components/RecordPaymentDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

export default function FinanceDashboard() {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');

  const isStaff = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'FINANCE';

  const { data: myStudentId, isLoading: isLoadingMyStudent } = useMyStudentId();

  const { data: summary, isLoading: isLoadingSummary, isError: isErrorSummary } = useFinanceSummary({
    enabled: isStaff,
  });
  const { data: fees, isLoading: isLoadingFees, isError: isErrorFees } = useAllStudentFees({
    enabled: isStaff,
  });

  if (!isStaff) {
    if (isLoadingMyStudent) {
      return (
        <div className="p-4 md:p-8 flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            <p className="text-xs text-slate-500 font-medium">Loading personal fee records...</p>
          </div>
        </div>
      );
    }

    if (!myStudentId) {
      return (
        <div className="p-4 md:p-8 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-xl mx-auto text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-700">
              <ShieldAlert className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {user?.role === 'PARENT' ? 'No Ward Profile Linked' : 'No Student Profile Linked'}
              </h1>
              <p className="text-slate-500 text-sm mt-2">
                We could not find an enrolled student record linked to your user account. Please contact the admissions or administration office.
              </p>
            </div>
            <div className="pt-2">
              <Button asChild className="bg-slate-900 text-white hover:bg-slate-800">
                <Link to="/dashboard">Return to Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="p-4 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
              {user?.role === 'PARENT' ? 'Ward Fee Statement' : 'My Invoices & Fee Account'}
            </h1>
            <p className="text-slate-500 text-sm">
              {user?.role === 'PARENT'
                ? 'Review assigned academic fees, payment history, and pending balances for your ward.'
                : 'Review your tuition invoices, component breakdowns, and payment history.'}
            </p>
          </div>
        </div>

        <StudentFeesTab studentId={myStudentId} />
      </div>
    );
  }

  const allFees = fees || [];
  const filteredFees = allFees.filter((fee: StudentFee) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      String(fee.id).includes(term) ||
      String(fee.studentId).includes(term) ||
      String(fee.feeStructureId).includes(term) ||
      fee.status.toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Finance & Accounts</h1>
          <p className="text-slate-500 text-sm">Manage institutional revenue, assign fee structures, and track student dues.</p>
        </div>
        <div className="flex items-center space-x-3">
          <CreateInvoiceDialog />
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-black text-white p-6 rounded-3xl shadow-sm relative overflow-hidden">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-6">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <div className="text-slate-400 text-sm mb-1">Total Collected</div>
          {isLoadingSummary ? (
             <Skeleton className="h-10 w-32 bg-slate-700 mb-4" />
          ) : isErrorSummary ? (
             <div className="text-sm font-bold text-red-400 mb-4 h-10 flex items-center">Failed to load</div>
          ) : (
             <div className="text-3xl font-bold mb-4">{formatCurrency(summary?.totalCollected)}</div>
          )}
          <div className="flex items-center text-xs text-slate-300 font-medium">
            <ArrowUpRight className="w-3 h-3 mr-1" />
            Verified collections
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-6">
            <Wallet className="w-5 h-5 text-slate-600" />
          </div>
          <div className="text-slate-500 text-sm mb-1">Pending Dues</div>
          {isLoadingSummary ? (
             <Skeleton className="h-10 w-32 mb-4" />
          ) : isErrorSummary ? (
             <div className="text-sm font-bold text-red-500 mb-4 h-10 flex items-center">Failed to load</div>
          ) : (
             <div className="text-3xl font-bold text-slate-900 mb-4">{formatCurrency(summary?.totalOutstanding)}</div>
          )}
          <div className="flex items-center text-xs text-slate-500 font-medium">
            <ArrowDownRight className="w-3 h-3 mr-1" />
            Uncollected balance
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-6">
            <TrendingDown className="w-5 h-5 text-slate-600" />
          </div>
          <div className="text-slate-500 text-sm mb-1">Gross Assigned Fees</div>
          {isLoadingSummary ? (
             <Skeleton className="h-10 w-32 mb-4" />
          ) : isErrorSummary ? (
             <div className="text-sm font-bold text-red-500 mb-4 h-10 flex items-center">Failed to load</div>
          ) : (
             <div className="text-3xl font-bold text-slate-900 mb-4">{formatCurrency(summary?.totalGrossAssigned)}</div>
          )}
          <div className="flex items-center text-xs text-slate-500 font-medium">
            <ArrowUpRight className="w-3 h-3 mr-1" />
            Total expected billings
          </div>
        </div>
      </div>

      {/* Table Filter Bar */}
      <div className="bg-white p-4 rounded-t-2xl border-b border-slate-100 flex justify-between items-center shadow-sm mt-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              type="text" 
              placeholder="Search by student, ID, or status..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border-slate-200 rounded-lg text-sm w-full sm:w-80 h-10"
            />
          </div>
        </div>
        <div className="text-sm text-slate-500 font-medium">
          {filteredFees.length} of {allFees.length} records
        </div>
      </div>

      {/* Student Fees Table */}
      <div className="bg-white rounded-b-2xl shadow-sm border border-slate-100 border-t-0 overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold px-6 py-4">Fee Record ID</TableHead>
              <TableHead className="font-semibold px-6 py-4">Student ID</TableHead>
              <TableHead className="font-semibold px-6 py-4">Net Payable</TableHead>
              <TableHead className="font-semibold px-6 py-4">Paid</TableHead>
              <TableHead className="font-semibold px-6 py-4">Outstanding</TableHead>
              <TableHead className="font-semibold px-6 py-4">Status</TableHead>
              <TableHead className="font-semibold px-6 py-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingFees ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="px-6 py-4"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="px-6 py-4"><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell className="px-6 py-4"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="px-6 py-4"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="px-6 py-4"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell className="px-6 py-4"><Skeleton className="h-6 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : isErrorFees ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-rose-600 font-medium">
                  Failed to load student fees. Please check service connectivity.
                </TableCell>
              </TableRow>
            ) : filteredFees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-28 text-center text-slate-500">
                  {searchTerm ? 'No fee records match your search criteria.' : 'No fee records found.'}
                  <span className="text-xs text-slate-400 mt-1 block">
                    Use "Assign Fee / Invoice" above to assign a structure to a student.
                  </span>
                </TableCell>
              </TableRow>
            ) : (
              filteredFees.map((fee: StudentFee) => {
                const outstanding = parseAmount(fee.outstandingAmount);
                return (
                  <TableRow key={fee.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell className="px-6 py-4">
                      <div className="font-semibold text-slate-900">FEE-{fee.id}</div>
                      <div className="text-xs text-slate-400">Struct #{fee.feeStructureId} | AY #{fee.academicYearId}</div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Link 
                        to={`/dashboard/students/${fee.studentId}`}
                        className="inline-flex items-center font-semibold text-slate-700 hover:text-primary transition-colors"
                      >
                        STD-{fee.studentId}
                        <ExternalLink className="w-3 h-3 ml-1 text-slate-400" />
                      </Link>
                    </TableCell>
                    <TableCell className="px-6 py-4 font-bold text-slate-900">
                      {formatCurrency(fee.netPayable)}
                    </TableCell>
                    <TableCell className="px-6 py-4 font-medium text-emerald-700">
                      {formatCurrency(fee.paidAmount)}
                    </TableCell>
                    <TableCell className={`px-6 py-4 font-bold ${outstanding > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                      {formatCurrency(fee.outstandingAmount)}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                        fee.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                        fee.status === 'OVERDUE' ? 'bg-rose-100 text-rose-800' :
                        fee.status === 'PARTIALLY_PAID' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {fee.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {outstanding > 0 && (
                          <RecordPaymentDialog fee={fee} />
                        )}
                        <Button asChild variant="ghost" size="sm" className="h-7 text-xs px-2 text-slate-600 hover:text-slate-900">
                          <Link to={`/dashboard/students/${fee.studentId}`}>
                            Profile
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
