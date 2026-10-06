import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronLeft, ChevronRight, MoreHorizontal, Loader2 } from 'lucide-react';
import { apiClient } from '../config/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { CreateStudentDialog } from '../components/CreateStudentDialog';
import { useDebounce } from '../hooks/useDebounce';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "../components/ui/table";
export default function StudentsList() {
    const navigate = useNavigate();
    const [page, setPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);
    const { data: studentsData, isLoading, isError } = useQuery({
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
    return (<div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Students</h1>
          <p className="text-slate-500 text-sm">Manage student records, enrollments, and academic statuses.</p>
        </div>
        <CreateStudentDialog />
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-t-2xl border-b border-slate-100 flex justify-between items-center shadow-sm mt-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <Input type="text" placeholder="Search students..." className="pl-9 pr-4 py-2 bg-slate-50 border-slate-200 rounded-lg text-sm w-72 h-10" value={searchTerm} onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0); // Reset page on new search
        }}/>
          </div>
          <Button variant="outline" className="flex items-center space-x-2 h-10 text-slate-600 border-slate-200">
            <Filter className="w-4 h-4"/>
            <span>Filters</span>
          </Button>
        </div>
        <div className="text-sm text-slate-500 font-medium">
          Showing {students.length} of {totalElements} students
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-b-2xl shadow-sm border border-slate-100 border-t-0">
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
            {isLoading ? (<TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                  <div className="flex justify-center items-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary"/>
                  </div>
                </TableCell>
              </TableRow>) : isError ? (<TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-destructive">Failed to load students.</TableCell>
              </TableRow>) : students.length === 0 ? (<TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-slate-500">No students found.</TableCell>
              </TableRow>) : (students.map((student) => (<TableRow key={student.id} className="hover:bg-slate-50/80 transition-colors cursor-pointer" onClick={() => navigate(`/dashboard/students/${student.id}`)}>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center uppercase">
                        {student.firstName?.charAt(0) || 'U'}
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
                      <MoreHorizontal className="w-4 h-4"/>
                    </Button>
                  </TableCell>
                </TableRow>)))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm">
           <Button variant="outline" className="text-slate-600 border-slate-200" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={isFirst}>
             <ChevronLeft className="w-4 h-4 mr-1"/> Previous
           </Button>
           <div className="text-slate-500 font-medium">Page {page + 1} of {totalPages}</div>
           <Button variant="outline" className="text-slate-600 border-slate-200" onClick={() => setPage(p => p + 1)} disabled={isLast}>
             Next <ChevronRight className="w-4 h-4 ml-1"/>
           </Button>
        </div>
      </div>
    </div>);
}
