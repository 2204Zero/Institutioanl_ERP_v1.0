import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronLeft, ChevronRight, MoreHorizontal, Loader2 } from 'lucide-react';
import { apiClient } from '../config/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useQuery } from '@tanstack/react-query';
import type { PaginatedResponse, Student } from '../types/student';
import { CreateStudentDialog } from '../components/CreateStudentDialog';
import { Skeleton } from '../components/ui/skeleton';
import { useDebounce } from '../hooks/useDebounce';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"

export default function StudentsList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data: studentsData, isLoading, isError } = useQuery<PaginatedResponse<Student>>({
    queryKey: ['students', page, debouncedSearch],
    queryFn: async () => {
      const res = await apiClient.get('/students', {
        params: {
          page: page,
          size: 10,
          search: debouncedSearch || undefined,
        }
      });
      return res.data?.data;
    }
  });

  const students = studentsData?.content || [];
  const totalElements = studentsData?.totalElements || 0;
  const totalPages = studentsData?.totalPages || 1;
  const isFirst = studentsData?.first ?? true;
  const isLast = studentsData?.last ?? true;

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Students</h1>
          <p className="text-slate-500 text-sm">Manage student profiles, academic records, and status.</p>
        </div>
        <CreateStudentDialog />
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center p-4 sm:p-6 gap-4">
        <div className="flex w-full md:w-auto items-center space-x-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              type="text" 
              placeholder="Search students..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border-slate-200 rounded-lg text-sm w-full h-10"
            />
          </div>
          <Button variant="outline" className="h-10 text-slate-600 border-slate-200">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
        <div className="text-sm text-slate-500 font-medium whitespace-nowrap">
          {totalElements} students total
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-x-auto mt-6">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold px-6 py-4">Student</TableHead>
              <TableHead className="font-semibold px-6 py-4">Roll Number</TableHead>
              <TableHead className="font-semibold px-6 py-4">Department</TableHead>
              <TableHead className="font-semibold px-6 py-4">Batch</TableHead>
              <TableHead className="font-semibold px-6 py-4">Status</TableHead>
              <TableHead className="font-semibold px-6 py-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="px-6 py-4"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-24 mt-2" /></TableCell>
                  <TableCell className="px-6 py-4"><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell className="px-6 py-4"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="px-6 py-4"><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell className="px-6 py-4"><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                  <TableCell className="px-6 py-4"><Skeleton className="h-8 w-8 rounded-md ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-destructive">Failed to load students.</TableCell>
              </TableRow>
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-slate-500">No students found.</TableCell>
              </TableRow>
            ) : (
              students.map((student) => (
                <TableRow 
                  key={student.id} 
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  onClick={() => navigate(`/dashboard/students/${student.id}`)}
                >
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                        {student.firstName[0]}{student.lastName[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{student.firstName} {student.lastName}</div>
                        <div className="text-xs text-slate-500">{student.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 font-medium text-slate-700">{student.rollNumber}</TableCell>
                  <TableCell className="px-6 py-4 text-slate-600">{student.department || '-'}</TableCell>
                  <TableCell className="px-6 py-4 text-slate-600">{student.batch || '-'}</TableCell>
                  <TableCell className="px-6 py-4">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      {student.status || 'ACTIVE'}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-700">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm">
           <Button 
             variant="outline" 
             className="text-slate-600 border-slate-200" 
             onClick={() => setPage(p => Math.max(0, p - 1))}
             disabled={isFirst}
           >
             <ChevronLeft className="w-4 h-4 mr-1" /> Previous
           </Button>
           <div className="text-slate-500 font-medium">Page {page + 1} of {totalPages}</div>
           <Button 
             variant="outline" 
             className="text-slate-600 border-slate-200"
             onClick={() => setPage(p => p + 1)}
             disabled={isLast}
           >
             Next <ChevronRight className="w-4 h-4 ml-1" />
           </Button>
        </div>
      </div>
    </div>
  );
}


