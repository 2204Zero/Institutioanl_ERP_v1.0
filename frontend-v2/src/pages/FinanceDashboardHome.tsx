import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageFrame } from '../components/ui/PageFrame';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/button';
import { 
  DollarSign, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Loader2, 
  AlertCircle, 
  Users, 
  Receipt as ReceiptIcon,
  ChevronRight 
} from 'lucide-react';
import { 
  useFinanceSummary, 
  useAllStudentFees, 
  formatCurrency, 
  parseAmount,
  type StudentFee 
} from '../hooks/queries/useFinance';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

export default function FinanceDashboardHome() {
  const { data: summary, isLoading: loadingSummary, isError: isErrorSummary } = useFinanceSummary();
  const { data: allFees, isLoading: loadingFees, isError: isErrorFees } = useAllStudentFees();

  const metrics = useMemo(() => {
    if (!summary) return null;
    const gross = parseAmount(summary.totalGrossAssigned);
    const collected = parseAmount(summary.totalCollected);
    const outstanding = parseAmount(summary.totalOutstanding);
    const collectionRate = gross > 0 ? Math.round((collected / gross) * 100) : 0;
    return { gross, collected, outstanding, collectionRate };
  }, [summary]);

  const recentFees = useMemo(() => {
    if (!allFees) return [];
    return [...allFees].slice(0, 8);
  }, [allFees]);

  return (
    <PageFrame
      title="Institutional Treasury & Receivables"
      description="Live financial ledger, revenue collections, and student receivables oversight."
    >
      {isErrorSummary && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>Institutional summary ledger could not be loaded. Please ensure finance permissions are granted.</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid gap-px md:grid-cols-2 lg:grid-cols-4 mb-8 bg-slate-200 border border-slate-200">
        
        {/* Metric 1: Total Gross Assigned */}
        <div className="bg-white p-5 hover:bg-slate-50 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Gross Receivables</h3>
            <Wallet className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-3xl font-extrabold tracking-tight text-slate-900">
            {loadingSummary ? (
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            ) : metrics ? (
              formatCurrency(metrics.gross)
            ) : (
              '₹0.00'
            )}
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium">
            Total tuition and fees billed
          </p>
        </div>

        {/* Metric 2: Total Collections */}
        <div className="bg-white p-5 hover:bg-slate-50 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Collected</h3>
            <ArrowUpRight className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold tracking-tight text-emerald-600">
            {loadingSummary ? (
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            ) : metrics ? (
              formatCurrency(metrics.collected)
            ) : (
              '₹0.00'
            )}
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium">
            Realized cash and online payments
          </p>
        </div>

        {/* Metric 3: Total Outstanding */}
        <div className="bg-white p-5 hover:bg-slate-50 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Outstanding Dues</h3>
            <ArrowDownRight className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold tracking-tight text-amber-600">
            {loadingSummary ? (
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            ) : metrics ? (
              formatCurrency(metrics.outstanding)
            ) : (
              '₹0.00'
            )}
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium">
            Pending institutional receivables
          </p>
        </div>

        {/* Metric 4: Collection Rate */}
        <div className="bg-white p-5 hover:bg-slate-50 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Collection Efficiency</h3>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-3xl font-extrabold tracking-tight text-slate-900">
            {loadingSummary ? (
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            ) : metrics ? (
              `${metrics.collectionRate}%`
            ) : (
              '0%'
            )}
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium">
            Collections against total billed
          </p>
        </div>
      </div>

      {/* Quick Action Navigation Strip */}
      <div className="bg-white border border-slate-200 p-4 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
            <ReceiptIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Institutional Billing & Ledger</h3>
            <p className="text-xs text-slate-500">Assign invoices, record student payments, and manage fee structures.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-50">
            <Link to="/dashboard/students" className="flex items-center space-x-1.5">
              <Users className="w-4 h-4" />
              <span>Student Lookup</span>
            </Link>
          </Button>
          <Button asChild size="sm" className="bg-slate-900 text-white hover:bg-slate-800">
            <Link to="/dashboard/finance" className="flex items-center space-x-1.5">
              <Wallet className="w-4 h-4" />
              <span>Manage Fee Records</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Recent Fee Records Table */}
      <div className="bg-white border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Recent Student Invoices</h3>
            <p className="text-xs text-slate-500 mt-0.5">Live view of assigned fee structures and balances.</p>
          </div>
          <Link to="/dashboard/finance" className="text-xs font-semibold text-slate-700 hover:text-primary flex items-center space-x-1">
            <span>View All Records</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loadingFees ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : isErrorFees ? (
          <div className="p-8 text-center bg-rose-50 border-t border-rose-100 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 mx-auto mb-2 text-rose-500" />
            Unable to load student fee records. Please verify API authorization.
          </div>
        ) : recentFees.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500 bg-slate-50/30">
            No fee records created yet. Use Fee Management to assign fee structures to enrolled students.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50 border-b border-slate-200">
                <TableRow>
                  <TableHead className="font-semibold px-4 py-3 text-xs uppercase tracking-wider text-slate-600">Invoice ID</TableHead>
                  <TableHead className="font-semibold px-4 py-3 text-xs uppercase tracking-wider text-slate-600">Student ID</TableHead>
                  <TableHead className="font-semibold px-4 py-3 text-xs uppercase tracking-wider text-slate-600 text-right">Gross Amount</TableHead>
                  <TableHead className="font-semibold px-4 py-3 text-xs uppercase tracking-wider text-slate-600 text-right">Paid Amount</TableHead>
                  <TableHead className="font-semibold px-4 py-3 text-xs uppercase tracking-wider text-slate-600 text-right">Outstanding</TableHead>
                  <TableHead className="font-semibold px-4 py-3 text-xs uppercase tracking-wider text-slate-600 text-center">Status</TableHead>
                  <TableHead className="font-semibold px-4 py-3 text-xs uppercase tracking-wider text-slate-600 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {recentFees.map((fee: StudentFee) => (
                  <TableRow key={fee.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell className="px-4 py-3 font-semibold text-slate-900 text-sm">
                      INV-{fee.id}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-slate-600 text-sm font-medium">
                      Student #{fee.studentId}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right text-slate-900 font-semibold text-sm">
                      {formatCurrency(fee.grossAmount)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right text-emerald-600 font-semibold text-sm">
                      {formatCurrency(fee.paidAmount)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right font-semibold text-sm">
                      <span className={parseAmount(fee.outstandingAmount) > 0 ? "text-amber-600" : "text-slate-400"}>
                        {formatCurrency(fee.outstandingAmount)}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      <StatusBadge status={fee.status} />
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-slate-600 hover:text-slate-900">
                        <Link to="/dashboard/finance">
                          Review &rarr;
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </PageFrame>
  );
}
