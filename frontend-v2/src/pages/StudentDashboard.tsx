import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../config/api';
import { PageFrame } from '../components/ui/PageFrame';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/button';
import { 
  CalendarCheck, 
  Wallet, 
  BookOpen, 
  ArrowUpRight, 
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

interface CourseRegistration {
  id: number;
  studentId: number;
  courseOfferingId: number;
  courseCode?: string;
  courseName?: string;
  sectionName?: string;
  credits?: number;
  status: string;
  registrationDate?: string;
}

interface StudentMeResponse {
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

export default function StudentDashboard() {
  // 1. Fetch personal student profile
  const { 
    data: student, 
    isLoading: loadingProfile, 
    isError: errorProfile 
  } = useQuery<StudentMeResponse>({
    queryKey: ['student-me-profile'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/students/me');
      return res.data?.data || res.data;
    },
    staleTime: 60000,
  });

  const studentId = student?.id;

  // 2. Fetch active course registrations
  const { 
    data: registrations = [], 
    isLoading: loadingCourses 
  } = useQuery<CourseRegistration[]>({
    queryKey: ['student-me-courses'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/students/me/course-registrations');
      const raw = res.data;
      return Array.isArray(raw) ? raw : (raw?.data || []);
    },
    staleTime: 60000,
  });

  // 3. Fetch attendance history
  const { 
    data: attendanceRecords = [], 
    isLoading: loadingAttendance 
  } = useQuery<AttendanceResponse[]>({
    queryKey: ['student-me-attendance', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      const res = await apiClient.get(`/api/v1/attendance/student/${studentId}`);
      const raw = res.data;
      return Array.isArray(raw) ? raw : (raw?.data || []);
    },
    enabled: !!studentId,
    staleTime: 30000,
  });

  // 4. Fetch fee accounts & invoices
  const { 
    data: fees = [], 
    isLoading: loadingFees 
  } = useQuery<StudentFee[]>({
    queryKey: ['student-me-fees', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      const res = await apiClient.get<StudentFee[]>(`/api/v1/finance/student-fees/student/${studentId}`);
      const raw = res.data as any;
      return Array.isArray(raw) ? raw : (raw?.data || []);
    },
    enabled: !!studentId,
    staleTime: 30000,
  });

  if (loadingProfile) {
    return (
      <PageFrame title="Student Portal" description="Connecting to your student records...">
        <div className="flex h-72 items-center justify-center bg-white border border-slate-200">
          <div className="flex flex-col items-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            <p className="text-sm text-slate-500 font-medium">Resolving your student profile...</p>
          </div>
        </div>
      </PageFrame>
    );
  }

  if (errorProfile || !student) {
    return (
      <PageFrame title="Student Portal" description="Student Identity Workspace">
        <div className="bg-white border border-slate-200 p-8 max-w-xl mx-auto text-center space-y-4 shadow-sm my-8">
          <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Student Record Not Linked</h2>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">
              Your login account is authenticated with the STUDENT role, but no active student profile is currently linked to your user ID.
            </p>
            <p className="text-slate-400 text-xs mt-2">
              Please contact the Registrar or Admissions department to associate your institutional enrollment with this login.
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

  // Calculate attendance statistics
  const totalSessions = attendanceRecords.length;
  const presentSessions = attendanceRecords.filter(r => r.status === 'PRESENT').length;
  const absentSessions = attendanceRecords.filter(r => r.status === 'ABSENT').length;
  const lateSessions = attendanceRecords.filter(r => r.status === 'LATE').length;
  const attendancePercentage = totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : null;

  // Calculate fee totals
  const totalPaid = fees.reduce((sum, f) => sum + parseAmount(f.paidAmount), 0);
  const totalOutstanding = fees.reduce((sum, f) => sum + parseAmount(f.outstandingAmount), 0);

  // Recent 5 attendance records
  const recentAttendance = [...attendanceRecords]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <PageFrame
      title="Student Workspace"
      description={`Welcome back, ${student.firstName}. Here is your academic and account overview.`}
      breadcrumbs={[{ label: "Dashboard" }]}
    >
      <div className="space-y-8">
        
        {/* Student Identity Card Banner */}
        <div className="bg-white border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start md:items-center space-x-4">
            <div className="w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xl uppercase shrink-0">
              {student.firstName?.[0] || 'S'}{student.lastName?.[0] || ''}
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">{student.fullName}</h2>
                <StatusBadge status={student.status} />
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500 font-medium">
                <span>Roll No: <strong className="text-slate-800">{student.rollNumber}</strong></span>
                <span>Department: <strong className="text-slate-800">{student.department || 'N/A'}</strong></span>
                <span>Batch: <strong className="text-slate-800">{student.batch || 'N/A'}</strong></span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-50">
              <Link to={`/dashboard/students/${student.id}`} className="flex items-center space-x-1.5">
                <User className="w-4 h-4" />
                <span>My Profile</span>
              </Link>
            </Button>
            <Button asChild size="sm" className="bg-slate-900 text-white hover:bg-slate-800">
              <Link to="/dashboard/finance" className="flex items-center space-x-1.5">
                <Wallet className="w-4 h-4" />
                <span>Fee Account</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid gap-px md:grid-cols-2 lg:grid-cols-4 bg-slate-200 border border-slate-200">
          
          {/* Card 1: Enrolled Courses */}
          <div className="bg-white p-5 hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Enrolled Courses</h3>
              <BookOpen className="h-4 w-4 text-slate-400" />
            </div>
            <div className="text-3xl font-extrabold tracking-tight text-slate-900">
              {loadingCourses ? (
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              ) : (
                student?.status === 'ACTIVE' 
                  ? registrations.filter(r => r.status === 'REGISTERED' || r.status === 'ACTIVE').length
                  : 0
              )}
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              {student?.status === 'ACTIVE'
                ? 'Active registrations this term'
                : `${student?.status || 'Non-Active'} status — 0 active enrollments`}
            </p>
          </div>

          {/* Card 2: Attendance Rate */}
          <div className="bg-white p-5 hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Attendance Rate</h3>
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
              {totalSessions > 0 ? `${presentSessions} of ${totalSessions} sessions attended` : 'No sessions recorded yet'}
            </p>
          </div>

          {/* Card 3: Total Tuition Paid */}
          <div className="bg-white p-5 hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Tuition Paid</h3>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-3xl font-extrabold tracking-tight text-emerald-600">
              {loadingFees ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : formatCurrency(totalPaid)}
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              Settled across {fees.length} billing schedule(s)
            </p>
          </div>

          {/* Card 4: Outstanding Balance */}
          <div className="bg-white p-5 hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending Balance</h3>
              <AlertCircle className={`h-4 w-4 ${totalOutstanding > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
            </div>
            <div className={`text-3xl font-extrabold tracking-tight ${totalOutstanding > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
              {loadingFees ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : formatCurrency(totalOutstanding)}
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              {totalOutstanding > 0 ? 'Payment due for current term' : 'All assigned fees clear'}
            </p>
          </div>

        </div>

        {/* Two-Column Detail Section */}
        <div className="grid gap-8 lg:grid-cols-2">
          
          {/* Left Column: Registered Courses */}
          <div className="bg-white border border-slate-200 shadow-sm flex flex-col">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Registered Courses</h3>
                <p className="text-xs text-slate-500 mt-0.5">Your current curriculum course enrollments</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded">
                {registrations.length} Courses
              </span>
            </div>

            <div className="flex-1 overflow-x-auto">
              {loadingCourses ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                </div>
              ) : registrations.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-medium text-slate-600">No course registrations found.</p>
                  <p className="text-xs text-slate-400 mt-1">Contact your department advisor to verify your course enrollment schedule.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-semibold px-4 py-3 text-xs">Code</TableHead>
                      <TableHead className="font-semibold px-4 py-3 text-xs">Course Name</TableHead>
                      <TableHead className="font-semibold px-4 py-3 text-xs text-center">Section</TableHead>
                      <TableHead className="font-semibold px-4 py-3 text-xs text-center">Credits</TableHead>
                      <TableHead className="font-semibold px-4 py-3 text-xs text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-100">
                    {registrations.map((reg: any) => {
                      const code = reg.courseOffering?.course?.code || reg.courseCode || `CR-${reg.courseOfferingId}`;
                      const title = reg.courseOffering?.course?.name || reg.courseName || `Course Offering #${reg.courseOfferingId}`;
                      const section = reg.section?.name || reg.sectionName || '-';
                      const credits = reg.courseOffering?.course?.credits ?? reg.credits ?? '-';

                      return (
                        <TableRow key={reg.id} className="hover:bg-slate-50/80 transition-colors">
                          <TableCell className="px-4 py-3 font-semibold text-xs text-slate-900">
                            {code}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-xs text-slate-700">
                            {title}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-xs text-center text-slate-600">
                            {section}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-xs text-center text-slate-600">
                            {credits}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-xs text-right">
                            <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                              reg.status === 'REGISTERED' || reg.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {reg.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>

          {/* Right Column: Attendance Records Snapshot */}
          <div className="bg-white border border-slate-200 shadow-sm flex flex-col">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Recent Attendance</h3>
                <p className="text-xs text-slate-500 mt-0.5">Last 5 recorded classroom attendance entries</p>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs font-semibold text-primary hover:text-primary/90 p-0 h-auto">
                <Link to="/dashboard/attendance" className="flex items-center space-x-1">
                  <span>View Full Ledger</span>
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
                  <p className="font-medium text-slate-600">No attendance records found.</p>
                  <p className="text-xs text-slate-400 mt-1">Class attendance sessions will populate here as instructors mark records.</p>
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

            {totalSessions > 0 && (
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span className="font-medium">Summary Breakdown:</span>
                <div className="flex items-center space-x-3">
                  <span className="text-emerald-700 font-bold">{presentSessions} Present</span>
                  <span className="text-rose-700 font-bold">{absentSessions} Absent</span>
                  {lateSessions > 0 && <span className="text-amber-700 font-bold">{lateSessions} Late</span>}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Fee & Billing Statement Section */}
        <div className="bg-white border border-slate-200 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 mb-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Tuition & Fee Statements</h3>
              <p className="text-xs text-slate-500 mt-0.5">Assigned institutional fee schedules and invoice status</p>
            </div>
            <Button asChild size="sm" variant="outline" className="border-slate-300">
              <Link to="/dashboard/finance" className="flex items-center space-x-1.5">
                <span>View Full Fee Ledger</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>

          {loadingFees ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : fees.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              <Wallet className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-medium text-slate-600">No fee schedules assigned to your account.</p>
              <p className="text-xs text-slate-400 mt-1">Fee assignments will be generated upon semester enrollment confirmation.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-semibold px-4 py-3 text-xs">Schedule ID</TableHead>
                    <TableHead className="font-semibold px-4 py-3 text-xs text-right">Net Payable</TableHead>
                    <TableHead className="font-semibold px-4 py-3 text-xs text-right">Amount Paid</TableHead>
                    <TableHead className="font-semibold px-4 py-3 text-xs text-right">Balance Due</TableHead>
                    <TableHead className="font-semibold px-4 py-3 text-xs text-center">Payment Status</TableHead>
                    <TableHead className="font-semibold px-4 py-3 text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100">
                  {fees.map((fee) => (
                    <TableRow key={fee.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="px-4 py-3 font-semibold text-xs text-slate-900">
                        INV-{fee.id} (Structure #{fee.feeStructureId})
                      </TableCell>
                      <TableCell className="px-4 py-3 text-xs text-right text-slate-800 font-medium">
                        {formatCurrency(fee.netPayable ?? fee.grossAmount)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-xs text-right text-emerald-600 font-semibold">
                        {formatCurrency(fee.paidAmount)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-xs text-right font-bold text-slate-900">
                        {formatCurrency(fee.outstandingAmount)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-xs text-center">
                        <span className={`inline-flex px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                          fee.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : fee.status === 'PARTIALLY_PAID'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {fee.status.replace('_', ' ')}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-xs text-right">
                        <Button asChild size="sm" variant="ghost" className="h-7 text-xs text-slate-700">
                          <Link to="/dashboard/finance">View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

      </div>
    </PageFrame>
  );
}
