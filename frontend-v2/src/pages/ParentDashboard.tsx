import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { apiClient } from '../config/api';
import { PageFrame } from '../components/ui/PageFrame';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/button';
import { 
  Users, 
  CalendarCheck, 
  Wallet, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Loader2,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency, parseAmount, type StudentFee } from '../hooks/queries/useFinance';
import type { AttendanceResponse } from '../types/attendance';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

interface GuardianWardDto {
  id: number;
  userId?: number;
  studentId: number;
  studentName: string;
  firstName: string;
  lastName: string;
  fullName: string;
  relation: string;
  phone: string;
  email: string;
  occupation?: string;
  address?: string;
  isEmergencyContact?: boolean;
}

interface WardDetailDto {
  id: number;
  rollNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  program: string;
  batch: string;
  status: string;
  enrollmentDate: string;
}

export default function ParentDashboard() {
  const { user } = useAuthStore();
  const [selectedWardIndex, setSelectedWardIndex] = useState(0);

  // 1. Fetch parent guardian records (supports multi-ward families)
  const { 
    data: wards = [], 
    isLoading: loadingWards, 
    isError: errorWards 
  } = useQuery<GuardianWardDto[]>({
    queryKey: ['parent-me-wards'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/guardians/me');
      const raw = res.data;
      return Array.isArray(raw) ? raw : (raw?.data || []);
    },
    staleTime: 60000,
  });

  // Deduplicate wards by distinct student identity
  const distinctWards = useMemo(() => {
    const seen = new Set<number>();
    return wards.filter(w => {
      if (!w.studentId || seen.has(w.studentId)) return false;
      seen.add(w.studentId);
      return true;
    });
  }, [wards]);

  const activeWard = distinctWards[selectedWardIndex] || distinctWards[0];
  const activeStudentId = activeWard?.studentId;

  // 2. Fetch selected ward's full student profile
  const { 
    data: wardProfile, 
    isLoading: loadingWardProfile 
  } = useQuery<WardDetailDto>({
    queryKey: ['parent-ward-profile', activeStudentId],
    queryFn: async () => {
      if (!activeStudentId) return null;
      const res = await apiClient.get(`/api/v1/students/${activeStudentId}`);
      return res.data?.data || res.data || null;
    },
    enabled: !!activeStudentId,
    staleTime: 60000,
  });

  // 3. Fetch selected ward's attendance records
  const { 
    data: attendanceRecords = [], 
    isLoading: loadingAttendance 
  } = useQuery<AttendanceResponse[]>({
    queryKey: ['parent-ward-attendance', activeStudentId],
    queryFn: async () => {
      if (!activeStudentId) return [];
      const res = await apiClient.get(`/api/v1/attendance/student/${activeStudentId}`);
      const raw = res.data;
      return Array.isArray(raw) ? raw : (raw?.data || []);
    },
    enabled: !!activeStudentId,
    staleTime: 30000,
  });

  // 4. Fetch selected ward's fee statement
  const { 
    data: fees = [], 
    isLoading: loadingFees 
  } = useQuery<StudentFee[]>({
    queryKey: ['parent-ward-fees', activeStudentId],
    queryFn: async () => {
      if (!activeStudentId) return [];
      const res = await apiClient.get<StudentFee[]>(`/api/v1/finance/student-fees/student/${activeStudentId}`);
      const raw = res.data as any;
      return Array.isArray(raw) ? raw : (raw?.data || []);
    },
    enabled: !!activeStudentId,
    staleTime: 30000,
  });

  if (loadingWards) {
    return (
      <PageFrame title="Ward Portal" description="Retrieving linked family records...">
        <div className="flex h-72 items-center justify-center bg-white border border-slate-200">
          <div className="flex flex-col items-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            <p className="text-sm text-slate-500 font-medium">Resolving your ward relationships...</p>
          </div>
        </div>
      </PageFrame>
    );
  }

  if (errorWards || distinctWards.length === 0) {
    return (
      <PageFrame title="Ward Portal" description="Parent & Guardian Access">
        <div className="bg-white border border-slate-200 p-8 max-w-xl mx-auto text-center space-y-4 shadow-sm my-8">
          <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">No Ward Linked to Account</h2>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">
              Your login account is registered with the PARENT role, but no student records are currently mapped to your guardian ID.
            </p>
            <p className="text-slate-400 text-xs mt-2">
              Please contact the school administration or registrar with your ward's roll number to link your guardian profile.
            </p>
          </div>
          <div className="pt-2">
            <Button asChild variant="outline" className="border-slate-300">
              <Link to="/login">Switch Account</Link>
            </Button>
          </div>
        </div>
      </PageFrame>
    );
  }

  // Attendance stats for selected ward
  const totalSessions = attendanceRecords.length;
  const presentSessions = attendanceRecords.filter(r => r.status === 'PRESENT').length;
  const attendancePercentage = totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : null;

  // Fee totals for selected ward
  const totalPaid = fees.reduce((sum, f) => sum + parseAmount(f.paidAmount), 0);
  const totalOutstanding = fees.reduce((sum, f) => sum + parseAmount(f.outstandingAmount), 0);

  // Recent 5 attendance sessions
  const recentAttendance = [...attendanceRecords]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const parentName = wards[0]?.firstName || wards[0]?.fullName || user?.username || 'Parent';

  return (
    <PageFrame
      title={`Ward Overview — Welcome, ${parentName}`}
      description="Monitor academic progress, classroom attendance, and billing for your ward(s)."
      breadcrumbs={[{ label: "Dashboard" }]}
    >
      <div className="space-y-8">
        
        {/* Multi-Ward Switcher (when parent has multiple distinct students) */}
        {distinctWards.length > 1 && (
          <div className="bg-white border border-slate-200 p-3 shadow-sm flex items-center space-x-2 overflow-x-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 px-3">Select Ward:</span>
            {distinctWards.map((ward, idx) => (
              <button
                key={ward.studentId}
                onClick={() => setSelectedWardIndex(idx)}
                className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${
                  selectedWardIndex === idx
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {ward.studentName || `Ward #${ward.studentId}`} ({ward.relation})
              </button>
            ))}
          </div>
        )}

        {/* Ward Profile Banner */}
        <div className="bg-white border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start md:items-center space-x-4">
            <div className="w-14 h-14 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xl uppercase shrink-0">
              {wardProfile?.firstName?.[0] || 'W'}{wardProfile?.lastName?.[0] || ''}
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  {wardProfile?.fullName || activeWard.studentName || 'Student Ward'}
                </h2>
                {wardProfile?.status && <StatusBadge status={wardProfile.status} />}
                <span className="text-[11px] font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded">
                  {activeWard.relation}
                </span>
                {activeWard.isEmergencyContact && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded">
                    Emergency Contact
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500 font-medium">
                <span>Roll No: <strong className="text-slate-800">{wardProfile?.rollNumber || `ID-${activeStudentId}`}</strong></span>
                <span>Department: <strong className="text-slate-800">{wardProfile?.department || 'Enrolled'}</strong></span>
                <span>Batch: <strong className="text-slate-800">{wardProfile?.batch || 'Active'}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-50">
              <Link to={`/dashboard/students/${activeStudentId}`} className="flex items-center space-x-1.5">
                <User className="w-4 h-4" />
                <span>Ward Profile</span>
              </Link>
            </Button>
            <Button asChild size="sm" className="bg-slate-900 text-white hover:bg-slate-800">
              <Link to="/dashboard/finance" className="flex items-center space-x-1.5">
                <Wallet className="w-4 h-4" />
                <span>Ward Fees</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Ward Key Metrics */}
        <div className="grid gap-px md:grid-cols-2 lg:grid-cols-4 bg-slate-200 border border-slate-200">
          
          {/* Metric 1: Ward Academic Standing */}
          <div className="bg-white p-5 hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Academic Standing</h3>
              <Users className="h-4 w-4 text-slate-400" />
            </div>
            <div className="text-2xl font-extrabold tracking-tight text-slate-900 truncate">
              {loadingWardProfile ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : (wardProfile?.department || 'Enrolled')}
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              Batch: {wardProfile?.batch || 'Active'}
            </p>
          </div>

          {/* Metric 2: Attendance Rate */}
          <div className="bg-white p-5 hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Ward Attendance</h3>
              <CalendarCheck className="h-4 w-4 text-slate-400" />
            </div>
            <div className="text-3xl font-extrabold tracking-tight text-slate-900">
              {loadingAttendance ? (
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              ) : attendancePercentage !== null ? (
                `${attendancePercentage}%`
              ) : (
                'N/A'
              )}
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              {totalSessions > 0 ? `${presentSessions} of ${totalSessions} sessions present` : 'No sessions recorded yet'}
            </p>
          </div>

          {/* Metric 3: Fees Settled */}
          <div className="bg-white p-5 hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Paid</h3>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-3xl font-extrabold tracking-tight text-emerald-600">
              {loadingFees ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : formatCurrency(totalPaid)}
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              Verified tuition payments
            </p>
          </div>

          {/* Metric 4: Outstanding Dues */}
          <div className="bg-white p-5 hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending Dues</h3>
              <AlertCircle className={`h-4 w-4 ${totalOutstanding > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
            </div>
            <div className={`text-3xl font-extrabold tracking-tight ${totalOutstanding > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
              {loadingFees ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : formatCurrency(totalOutstanding)}
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              {totalOutstanding > 0 ? 'Outstanding balance for this ward' : 'No balance due'}
            </p>
          </div>

        </div>

        {/* Two-Column Detail Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          
          {/* Left Column: Recent Attendance */}
          <div className="bg-white border border-slate-200 shadow-sm flex flex-col">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Ward Attendance Sessions</h3>
                <p className="text-xs text-slate-500 mt-0.5">Most recent classroom attendance records</p>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs font-semibold text-primary hover:text-primary/90 p-0 h-auto">
                <Link to="/dashboard/attendance" className="flex items-center space-x-1">
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>

            <div className="flex-1 overflow-x-auto">
              {loadingAttendance ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                </div>
              ) : recentAttendance.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  <CalendarCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-medium text-slate-600">No attendance entries for this ward.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-semibold px-4 py-3 text-xs">Date</TableHead>
                      <TableHead className="font-semibold px-4 py-3 text-xs">Course</TableHead>
                      <TableHead className="font-semibold px-4 py-3 text-xs text-center">Status</TableHead>
                      <TableHead className="font-semibold px-4 py-3 text-xs">Marked By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-100">
                    {recentAttendance.map((rec) => (
                      <TableRow key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                        <TableCell className="px-4 py-3 text-xs font-medium text-slate-900">
                          {new Date(rec.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-xs text-slate-600">
                          {rec.courseCode || 'Class Session'}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-xs text-center">
                          <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded ${
                            rec.status === 'PRESENT'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rec.status === 'ABSENT'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {rec.status}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-xs text-slate-500">
                          {rec.markedBy || 'Faculty'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>

          {/* Right Column: Fee Schedule */}
          <div className="bg-white border border-slate-200 shadow-sm flex flex-col">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Ward Fee Invoices</h3>
                <p className="text-xs text-slate-500 mt-0.5">Assigned tuition and academic fee schedules</p>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs font-semibold text-primary hover:text-primary/90 p-0 h-auto">
                <Link to="/dashboard/finance" className="flex items-center space-x-1">
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>

            <div className="flex-1 overflow-x-auto">
              {loadingFees ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                </div>
              ) : fees.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  <Wallet className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-medium text-slate-600">No invoices assigned to this ward.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-semibold px-4 py-3 text-xs">Invoice</TableHead>
                      <TableHead className="font-semibold px-4 py-3 text-xs text-right">Net Amount</TableHead>
                      <TableHead className="font-semibold px-4 py-3 text-xs text-right">Balance Due</TableHead>
                      <TableHead className="font-semibold px-4 py-3 text-xs text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-100">
                    {fees.map((fee) => (
                      <TableRow key={fee.id} className="hover:bg-slate-50/80 transition-colors">
                        <TableCell className="px-4 py-3 font-semibold text-xs text-slate-900">
                          INV-{fee.id}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-xs text-right text-slate-800">
                          {formatCurrency(fee.netPayable ?? fee.grossAmount)}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-xs text-right font-bold text-slate-900">
                          {formatCurrency(fee.outstandingAmount)}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-xs text-center">
                          <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded ${
                            fee.status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : fee.status === 'PARTIALLY_PAID'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {fee.status.replace('_', ' ')}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>

        </div>

      </div>
    </PageFrame>
  );
}
