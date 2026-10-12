import { useState } from 'react';
import { 
  ShieldAlert, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Receipt, 
  ChevronDown, 
  ChevronUp,
  PlusCircle,
  Loader2
} from 'lucide-react';
import { useStudentFees, formatCurrency, parseAmount, type StudentFee } from '../hooks/queries/useFinance';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from './ui/button';
import { CreateInvoiceDialog } from './CreateInvoiceDialog';
import { RecordPaymentDialog } from './RecordPaymentDialog';

interface StudentFeesTabProps {
  studentId: number;
}

export function StudentFeesTab({ studentId }: StudentFeesTabProps) {
  const { user } = useAuthStore();
  const canManage = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'FINANCE';

  const { data: fees, isLoading, isError, error, refetch } = useStudentFees(studentId);
  const [expandedRecordIds, setExpandedRecordIds] = useState<Record<number, boolean>>({});

  const toggleExpand = (id: number) => {
    setExpandedRecordIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (isLoading) {
    return (
      <div className="border border-slate-200 bg-white p-8">
        <div className="flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          <p className="text-xs text-slate-500 font-medium">Loading student fee records...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    const status = (error as any)?.response?.status;
    const errorMsg = (error as any)?.response?.data?.message || (error as any)?.response?.data?.error;

    if (status === 403) {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-red-50/50 border border-red-200 text-center">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mb-3">
            <ShieldAlert className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-red-900">403 - Access Denied</h3>
          <p className="text-slate-600 text-xs max-w-md mt-1">
            You do not have permission to access financial records for this student. Student finance data is restricted to authorized Finance officers, administrators, and the student themselves.
          </p>
        </div>
      );
    }

    if (status === 401) {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-amber-50/50 border border-amber-200 text-center">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mb-3">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-amber-900">401 - Session Expired</h3>
          <p className="text-slate-600 text-xs max-w-md mt-1">
            Your login session has expired. Please refresh or sign in again to access financial details.
          </p>
        </div>
      );
    }

    if (status === 404) {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-slate-200 text-center">
          <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center mb-3">
            <AlertCircle className="w-5 h-5 text-slate-500" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">404 - Student Not Found</h3>
          <p className="text-slate-500 text-xs max-w-md mt-1">
            No active student profile matches ID #{studentId}.
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-50/30 border border-red-200 text-center">
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mb-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
        </div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-red-900">Failed to Retrieve Fee Records</h3>
        <p className="text-slate-600 text-xs max-w-md mt-1">
          {errorMsg || 'An error occurred while communicating with the finance service. Please try again.'}
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4 text-xs">
          Retry Request
        </Button>
      </div>
    );
  }

  const feeList = fees || [];

  if (feeList.length === 0) {
    return (
      <div className="border border-slate-200 bg-white">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Assigned Fees & Invoices</h3>
          {canManage && (
            <CreateInvoiceDialog
              initialStudentId={studentId}
              trigger={
                <Button size="sm" className="h-7 text-xs bg-slate-900 text-white hover:bg-slate-800">
                  <PlusCircle className="w-3.5 h-3.5 mr-1" /> Assign Fee Structure
                </Button>
              }
            />
          )}
        </div>
        <div className="p-8 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
            <Receipt className="w-6 h-6 text-slate-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">No Fee Records Assigned</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              There are currently no fee structures or invoices linked to this student for any academic term.
            </p>
          </div>
          {canManage && (
            <div className="pt-2">
              <CreateInvoiceDialog
                initialStudentId={studentId}
                trigger={
                  <Button variant="outline" size="sm" className="text-xs">
                    Assign First Fee Structure
                  </Button>
                }
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Calculate cumulative ledger sums
  const totalNet = feeList.reduce((acc, f) => acc + parseAmount(f.netPayable), 0);
  const totalPaid = feeList.reduce((acc, f) => acc + parseAmount(f.paidAmount), 0);
  const totalDue = feeList.reduce((acc, f) => acc + parseAmount(f.outstandingAmount), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Paid
          </span>
        );
      case 'PARTIALLY_PAID':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3 mr-1" /> Partial
          </span>
        );
      case 'OVERDUE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800">
            <AlertCircle className="w-3 h-3 mr-1" /> Overdue
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Financial Ledger Overview Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white border border-slate-200 p-4">
        <div className="p-3 bg-slate-50 border border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Total Net Payable</span>
          <span className="text-xl font-bold text-slate-900 mt-1 block">{formatCurrency(totalNet)}</span>
        </div>
        <div className="p-3 bg-emerald-50/50 border border-emerald-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">Total Paid to Date</span>
          <span className="text-xl font-bold text-emerald-700 mt-1 block">{formatCurrency(totalPaid)}</span>
        </div>
        <div className={`p-3 border ${totalDue > 0 ? 'bg-rose-50/50 border-rose-200' : 'bg-slate-50 border-slate-100'}`}>
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${totalDue > 0 ? 'text-rose-700' : 'text-slate-500'}`}>
            Outstanding Balance
          </span>
          <span className={`text-xl font-bold mt-1 block ${totalDue > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
            {formatCurrency(totalDue)}
          </span>
        </div>
      </div>

      {/* Fee Records Cards */}
      <div className="border border-slate-200 bg-white">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Fee Invoices & Ledgers</h3>
            <span className="text-[11px] text-slate-500">{feeList.length} billing cycle(s) recorded</span>
          </div>
          {canManage && (
            <CreateInvoiceDialog
              initialStudentId={studentId}
              trigger={
                <Button size="sm" className="h-7 text-xs bg-slate-900 text-white hover:bg-slate-800">
                  <PlusCircle className="w-3.5 h-3.5 mr-1" /> Assign Fee Structure
                </Button>
              }
            />
          )}
        </div>

        <div className="divide-y divide-slate-200">
          {feeList.map((fee: StudentFee) => {
            const isExpanded = !!expandedRecordIds[fee.id];
            const hasComponents = fee.components && fee.components.length > 0;
            const outstanding = parseAmount(fee.outstandingAmount);

            return (
              <div key={fee.id} className="p-4 space-y-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-700">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-slate-900">Record #{fee.id}</span>
                        <span className="text-xs text-slate-500 font-mono">Structure ID: {fee.feeStructureId}</span>
                        <span className="text-xs text-slate-400">|</span>
                        <span className="text-xs text-slate-500">Academic Year: {fee.academicYearId}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {fee.createdAt ? `Generated on ${new Date(fee.createdAt).toLocaleDateString()}` : 'Active Cycle'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-start sm:self-auto">
                    {getStatusBadge(fee.status)}
                    {canManage && outstanding > 0 && (
                      <RecordPaymentDialog fee={fee} />
                    )}
                  </div>
                </div>

                {/* Amounts Breakdown Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50/70 p-3 rounded border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Gross Amount</span>
                    <span className="font-semibold text-slate-800">{formatCurrency(fee.grossAmount)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Scholarship / Concession</span>
                    <span className="font-semibold text-slate-800">
                      {formatCurrency(parseAmount(fee.scholarshipAmount) + parseAmount(fee.concessionAmount))}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Paid Amount</span>
                    <span className="font-bold text-emerald-700">{formatCurrency(fee.paidAmount)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Outstanding Balance</span>
                    <span className={`font-bold ${outstanding > 0 ? 'text-rose-700' : 'text-slate-800'}`}>
                      {formatCurrency(fee.outstandingAmount)}
                    </span>
                  </div>
                </div>

                {/* Component-level Breakdown */}
                {hasComponents && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => toggleExpand(fee.id)}
                      className="flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5 mr-1 text-slate-400" /> Hide Breakdown ({fee.components!.length} components)
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5 mr-1 text-slate-400" /> View Breakdown ({fee.components!.length} components)
                        </>
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 overflow-x-auto border border-slate-200 rounded">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold">
                            <tr>
                              <th className="px-3 py-2">Fee Head</th>
                              <th className="px-3 py-2 text-right">Gross</th>
                              <th className="px-3 py-2 text-right">Paid</th>
                              <th className="px-3 py-2 text-right">Outstanding</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {fee.components!.map(c => (
                              <tr key={c.id} className="hover:bg-slate-50">
                                <td className="px-3 py-2 font-medium text-slate-900">
                                  {c.feeHeadName || c.feeHeadCode || `Head #${c.id}`}
                                  {c.feeHeadCode && c.feeHeadName && (
                                    <span className="ml-1 text-[10px] text-slate-400 font-mono">({c.feeHeadCode})</span>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-right font-medium text-slate-700">{formatCurrency(c.grossAmount)}</td>
                                <td className="px-3 py-2 text-right font-medium text-emerald-700">{formatCurrency(c.paidAmount)}</td>
                                <td className="px-3 py-2 text-right font-bold text-slate-900">{formatCurrency(c.outstandingAmount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
