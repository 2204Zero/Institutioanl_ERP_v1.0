import React from 'react';
import { Search, DollarSign, Loader2, ArrowUpRight, ArrowDownRight, Wallet, TrendingDown } from 'lucide-react';
import { Input } from '../components/ui/input';
import { useFinanceSummary, useAllStudentFees } from '../hooks/queries/useFinance';
import { Skeleton } from '../components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"

export default function FinanceDashboard() {
  const { data: summary, isLoading: isLoadingSummary, isError: isErrorSummary } = useFinanceSummary();
  const { data: fees, isLoading: isLoadingFees, isError: isErrorFees } = useAllStudentFees();

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Finance</h1>
          <p className="text-slate-500 text-sm">Manage institutional revenue, student fees, and pending dues.</p>
        </div>
        {/* We can add Create Fee Structure button here later */}
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
          ) : (
             <div className="text-3xl font-bold mb-4">?{summary?.totalCollected?.toLocaleString() || '0'}</div>
          )}
          <div className="flex items-center text-xs text-slate-300 font-medium">
            <ArrowUpRight className="w-3 h-3 mr-1" />
            Active term
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-6">
            <Wallet className="w-5 h-5 text-slate-600" />
          </div>
          <div className="text-slate-500 text-sm mb-1">Pending Dues</div>
          {isLoadingSummary ? (
             <Skeleton className="h-10 w-32 mb-4" />
          ) : (
             <div className="text-3xl font-bold text-slate-900 mb-4">?{summary?.totalOutstanding?.toLocaleString() || '0'}</div>
          )}
          <div className="flex items-center text-xs text-slate-500 font-medium">
            <ArrowDownRight className="w-3 h-3 mr-1" />
            Needs attention
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-6">
            <TrendingDown className="w-5 h-5 text-slate-600" />
          </div>
          <div className="text-slate-500 text-sm mb-1">Gross Assigned Fees</div>
          {isLoadingSummary ? (
             <Skeleton className="h-10 w-32 mb-4" />
          ) : (
             <div className="text-3xl font-bold text-slate-900 mb-4">?{summary?.totalGrossAssigned?.toLocaleString() || '0'}</div>
          )}
          <div className="flex items-center text-xs text-slate-500 font-medium">
            <ArrowUpRight className="w-3 h-3 mr-1" />
            Total expected revenue
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-t-2xl border-b border-slate-100 flex justify-between items-center shadow-sm mt-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              type="text" 
              placeholder="Search student fees..." 
              className="pl-9 pr-4 py-2 bg-slate-50 border-slate-200 rounded-lg text-sm w-full sm:w-72 h-10"
            />
          </div>
        </div>
        <div className="text-sm text-slate-500 font-medium">
          {fees?.length || 0} records
        </div>
      </div>

      <div className="bg-white rounded-b-2xl shadow-sm border border-slate-100 border-t-0">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold px-6 py-4">Fee Record ID</TableHead>
              <TableHead className="font-semibold px-6 py-4">Student ID</TableHead>
              <TableHead className="font-semibold px-6 py-4">Net Payable</TableHead>
              <TableHead className="font-semibold px-6 py-4">Outstanding</TableHead>
              <TableHead className="font-semibold px-6 py-4">Status</TableHead>
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
                  <TableCell className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                </TableRow>
              ))
            ) : isErrorFees ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-destructive">Failed to load student fees.</TableCell>
              </TableRow>
            ) : fees?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-slate-500">No student fees assigned yet.</TableCell>
              </TableRow>
            ) : (
              fees?.map((fee) => (
                <TableRow key={fee.id} className="hover:bg-slate-50/80 transition-colors">
                  <TableCell className="px-6 py-4">
                    <div className="font-semibold text-slate-900">FEE-{fee.id}</div>
                    <div className="text-xs text-slate-400">Struct: {fee.feeStructureId}</div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="font-semibold text-slate-700">STD-{fee.studentId}</div>
                  </TableCell>
                  <TableCell className="px-6 py-4 font-bold text-slate-900">
                    ?{fee.netPayable?.toLocaleString()}
                  </TableCell>
                  <TableCell className="px-6 py-4 font-bold text-red-600">
                    ?{fee.outstandingAmount?.toLocaleString()}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                      fee.status === 'PAID' ? 'bg-green-100 text-green-700' :
                      fee.status === 'OVERDUE' ? 'bg-red-100 text-red-700' :
                      fee.status === 'PARTIALLY_PAID' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {fee.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

