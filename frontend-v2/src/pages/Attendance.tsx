import React from 'react';
import { Search, CalendarCheck, Loader2 } from 'lucide-react';
import { apiClient } from '../config/api';
import { Input } from '../components/ui/input';
import { useQuery } from '@tanstack/react-query';
import type { AttendanceResponse } from '../types/attendance';
import { TakeAttendanceDialog } from '../components/TakeAttendanceDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"

export default function Attendance() {
  const { data: records, isLoading, isError } = useQuery<AttendanceResponse[]>({
    queryKey: ['attendance'],
    queryFn: async () => {
      const res = await apiClient.get('/attendance');
      return res.data || [];
    }
  });

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Attendance</h1>
          <p className="text-slate-500 text-sm">Monitor daily student attendance records.</p>
        </div>
        <button className="bg-black text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-slate-800 transition-colors">View Exceptions</button>
      </div>

      <div className="bg-white p-4 rounded-t-2xl border-b border-slate-100 flex justify-between items-center shadow-sm mt-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              type="text" 
              placeholder="Search by student name..." 
              className="pl-9 pr-4 py-2 bg-slate-50 border-slate-200 rounded-lg text-sm w-full sm:w-72 h-10"
            />
          </div>
        </div>
        <div className="text-sm text-slate-500 font-medium">
          {records?.length || 0} records
        </div>
      </div>

      <div className="bg-white rounded-b-2xl shadow-sm border border-slate-100 border-t-0">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold px-6 py-4">Date</TableHead>
              <TableHead className="font-semibold px-6 py-4">Student Name</TableHead>
              <TableHead className="font-semibold px-6 py-4">Roll Number</TableHead>
              <TableHead className="font-semibold px-6 py-4">Status</TableHead>
              <TableHead className="font-semibold px-6 py-4">Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                  <div className="flex justify-center items-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-destructive">Failed to load attendance.</TableCell>
              </TableRow>
            ) : records?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-slate-500">No attendance records found.</TableCell>
              </TableRow>
            ) : (
              records?.map((record) => (
                <TableRow key={record.id} className="hover:bg-slate-50/80 transition-colors">
                                    <TableCell className="px-6 py-4 font-medium text-slate-700">
                    {Array.isArray(record.date) 
                      ? new Date(record.date[0], record.date[1] - 1, record.date[2]).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                      : new Date(record.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) === 'Invalid Date'
                        ? record.date 
                        : new Date(record.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                    }
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                        <span>{record.studentName?.charAt(0) || '?'}</span>
                      </div>
                      <div className="font-semibold text-slate-900">{record.studentName}</div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-slate-600">{record.rollNumber}</TableCell>
                  <TableCell className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                      record.status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                      record.status === 'ABSENT' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {record.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-slate-500 text-sm">{record.remarks || '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}






