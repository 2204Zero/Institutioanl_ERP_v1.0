import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../config/api';
import { Link } from 'react-router-dom';
import { PageFrame } from '../components/ui/PageFrame';
import { Input } from '../components/ui/input';
import { Search, Loader2, Filter, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';
import { CreateStudentDialog } from '../components/CreateStudentDialog';
import type { PaginatedResponse, Student } from '../types/student';
import { useAuthStore } from '../store/useAuthStore';

function formatDateDisplay(val: any): string {
  if (!val) return 'N/A';
  if (Array.isArray(val) && val.length >= 3) {
    const [y, m, d] = val;
    return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  const d = new Date(val);
  return isNaN(d.getTime()) ? String(val) : d.toLocaleDateString();
}

export default function StudentsList() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const { data, isLoading, isError } = useQuery<PaginatedResponse<Student>>({
    queryKey: ['students', page, size, debouncedSearch, statusFilter],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/students', {
        params: { 
          page, 
          size, 
          search: debouncedSearch || undefined,
          status: statusFilter || undefined,
          sortBy: 'id',
          sortDir: 'desc'
        }
      });
      return res.data?.data;
    },
  });

  const students = (data as PaginatedResponse<Student>)?.content || [];
  const totalPages = (data as PaginatedResponse<Student>)?.totalPages || 0;
  const totalElements = (data as PaginatedResponse<Student>)?.totalElements || 0;

  return (
    <PageFrame
      title="Student Directory"
      description="Manage institutional student records and profiles."
      breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Students' }]}
      actions={
        isAdmin && (
          <CreateStudentDialog />
        )
      }
    >
      <div className="flex flex-col min-h-[500px] border border-slate-200 bg-white">
        <div className="p-3 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0 md:space-x-4">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search by name, email, or enrollment ID..." 
              className="pl-9 h-8 text-xs border-slate-300"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400 hidden md:block" />
            <select 
              className="w-full md:w-auto bg-white border border-slate-300 text-xs rounded px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="GRADUATED">Graduated</option>
              <option value="ALUMNI">Alumni</option>
              <option value="DROPPED">Dropped</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 uppercase text-[10px] font-bold tracking-wider sticky top-0">
              <tr>
                <th className="px-3 py-2 border-r border-slate-200/50">Student (Internal ID)</th>
                <th className="px-3 py-2 border-r border-slate-200/50">Canonical Enrollment No</th>
                <th className="px-3 py-2 border-r border-slate-200/50">Roll Number</th>
                <th className="px-3 py-2 border-r border-slate-200/50">Department / Contact</th>
                <th className="px-3 py-2 border-r border-slate-200/50">Status</th>
                <th className="px-3 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[13px]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-3 py-12 text-center">
                    <Loader2 className="w-5 h-5 animate-spin text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-500 text-xs">Loading directory...</p>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="px-3 py-12 text-center text-red-500 text-xs">
                    Failed to load students. Please try again later.
                  </td>
                </tr>
              ) : students.length > 0 ? (
                students.map((student: Student) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-3 py-2 border-r border-slate-100/50">
                      <div className="flex items-center space-x-2">
                        <div className="h-7 w-7 rounded bg-slate-900 flex items-center justify-center text-white font-bold shrink-0 text-[10px]">
                          {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <p className="font-semibold text-slate-900">{student.firstName} {student.lastName}</p>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                              #{student.id}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500">Joined {formatDateDisplay(student.enrollmentDate || student.createdAt)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs font-semibold text-slate-800 border-r border-slate-100/50">
                      {student.enrollmentNumber ? (
                        <span>{student.enrollmentNumber}</span>
                      ) : (
                        <span className="text-slate-400 italic">Pending Allocation</span>
                      )}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-600 border-r border-slate-100/50">
                      {student.rollNumber || <span className="text-slate-400 italic">None</span>}
                    </td>
                    <td className="px-3 py-2 border-r border-slate-100/50">
                      <p className="text-slate-800 text-xs font-medium">{student.department || 'General'}</p>
                      <p className="text-[11px] text-slate-500">{student.email}</p>
                    </td>
                    <td className="px-3 py-2 border-r border-slate-100/50">
                      <StatusBadge status={student.status} />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Link to={`/dashboard/students/${student.id}`} className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center">
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-3 py-16 text-center">
                    <div className="w-10 h-10 bg-slate-100 flex items-center justify-center mx-auto mb-2">
                      <Search className="w-5 h-5 text-slate-400" />
                    </div>
                    <p className="text-slate-900 font-medium text-sm">No students found</p>
                    <p className="text-slate-500 text-xs mt-1">Try adjusting your search or filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <p className="text-[11px] text-slate-500 uppercase tracking-wide">
            Showing <span className="font-bold text-slate-900">{students.length > 0 ? page * size + 1 : 0}</span> to <span className="font-bold text-slate-900">{Math.min((page + 1) * size, totalElements)}</span> of <span className="font-bold text-slate-900">{totalElements}</span> results
          </p>
          <div className="flex items-center space-x-1">
            <button 
              className="px-2 py-1 text-[11px] font-semibold border border-slate-300 rounded bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 inline-flex items-center"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0 || isLoading}
            >
              <ChevronLeft className="w-3 h-3 mr-1" /> Prev
            </button>
            <div className="text-[11px] font-bold text-slate-700 px-2">
              Page {page + 1} of {Math.max(1, totalPages)}
            </div>
            <button 
              className="px-2 py-1 text-[11px] font-semibold border border-slate-300 rounded bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 inline-flex items-center"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || isLoading}
            >
              Next <ChevronRight className="w-3 h-3 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </PageFrame>
  );
}