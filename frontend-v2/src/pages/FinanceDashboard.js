import React from 'react';
import { Search, DollarSign, Loader2, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { apiClient } from '../config/api';
import { Input } from '../components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { CreateInvoiceDialog } from '../components/CreateInvoiceDialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "../components/ui/table";
export default function FinanceDashboard() {
    const { data: fees, isLoading, isError } = useQuery({
        queryKey: ['fees'],
        queryFn: async () => {
            const res = await apiClient.get('/finance/fees');
            return res.data || [];
        }
    });
    const totalRevenue = fees?.filter(f => f.status === 'PAID').reduce((acc, curr) => acc + curr.amount, 0) || 0;
    const pendingDues = fees?.filter(f => f.status === 'PENDING' || f.status === 'OVERDUE').reduce((acc, curr) => acc + curr.amount, 0) || 0;
    return (<div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Finance</h1>
          <p className="text-slate-500 text-sm">Manage institutional revenue, fee invoices, and pending dues.</p>
        </div>
        <CreateInvoiceDialog />
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#dc2626] text-white p-6 rounded-3xl shadow-sm relative overflow-hidden">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-6">
            <DollarSign className="w-5 h-5 text-primary"/>
          </div>
          <div className="text-slate-400 text-sm mb-1">Total Collected</div>
          <div className="text-3xl font-bold mb-4">${totalRevenue.toLocaleString()}</div>
          <div className="flex items-center text-xs text-primary font-medium">
            <ArrowUpRight className="w-3 h-3 mr-1"/>
            Active term
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-6">
            <Wallet className="w-5 h-5 text-slate-600"/>
          </div>
          <div className="text-slate-500 text-sm mb-1">Pending Dues</div>
          <div className="text-3xl font-bold text-slate-900 mb-4">${pendingDues.toLocaleString()}</div>
          <div className="flex items-center text-xs text-slate-500 font-medium">
            <ArrowDownRight className="w-3 h-3 mr-1"/>
            Needs attention
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-t-2xl border-b border-slate-100 flex justify-between items-center shadow-sm mt-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <Input type="text" placeholder="Search invoices..." className="pl-9 pr-4 py-2 bg-slate-50 border-slate-200 rounded-lg text-sm w-72 h-10"/>
          </div>
        </div>
        <div className="text-sm text-slate-500 font-medium">
          {fees?.length || 0} invoices
        </div>
      </div>

      <div className="bg-white rounded-b-2xl shadow-sm border border-slate-100 border-t-0">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold px-6 py-4">Invoice Details</TableHead>
              <TableHead className="font-semibold px-6 py-4">Student</TableHead>
              <TableHead className="font-semibold px-6 py-4">Amount</TableHead>
              <TableHead className="font-semibold px-6 py-4">Due Date</TableHead>
              <TableHead className="font-semibold px-6 py-4">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (<TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                  <div className="flex justify-center items-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary"/>
                  </div>
                </TableCell>
              </TableRow>) : isError ? (<TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-destructive">Failed to load fees.</TableCell>
              </TableRow>) : fees?.length === 0 ? (<TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-slate-500">No invoices found.</TableCell>
              </TableRow>) : (fees?.map((fee) => (<TableRow key={fee.id} className="hover:bg-slate-50/80 transition-colors">
                  <TableCell className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{fee.description}</div>
                    <div className="text-xs text-slate-400">INV-{fee.id}</div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="font-semibold text-slate-700">{fee.studentName}</div>
                    <div className="text-xs text-slate-500">{fee.rollNumber}</div>
                  </TableCell>
                  <TableCell className="px-6 py-4 font-bold text-slate-900">
                    ${fee.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-slate-600">
                    {fee.dueDate}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${fee.status === 'PAID' ? 'bg-green-100 text-green-700' :
                fee.status === 'OVERDUE' ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-slate-700'}`}>
                      {fee.status}
                    </span>
                  </TableCell>
                </TableRow>)))}
          </TableBody>
        </Table>
      </div>
    </div>);
}
