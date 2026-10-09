import { useAuthStore } from '../store/useAuthStore';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../config/api';
import { PageFrame } from '../components/ui/PageFrame';
import { ShieldAlert, Users, Store, UserCheck, Loader2 } from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Link } from 'react-router-dom';
import type { Student, PaginatedResponse } from '../types/student';
import FacultyDashboard from './FacultyDashboard';

interface UserDTO { id: number; username: string; email: string; role: string; enabled: boolean; }
interface Department { id: number; name: string; code: string; }
interface Application { id: number; applicantName: string; status: string; appliedAt: string; programName: string; }

export default function Dashboard() {
  const { user } = useAuthStore();
  const role = user?.role || '';

  if (role === 'FACULTY') {
    return <FacultyDashboard />;
  }

  const isSuperAdmin = role === 'SUPER_ADMIN';
  const isAdmin = role === 'ADMIN';
  const isManagement = isSuperAdmin || isAdmin;

  const { data: usersData, isLoading: loadingUsers } = useQuery<UserDTO[]>({
    queryKey: ['dashboard-users'],
    enabled: isManagement,
    queryFn: async () => (await apiClient.get('/api/v1/admin/users')).data
  });

  const { data: departmentsData } = useQuery<Department[]>({
    queryKey: ['dashboard-depts'],
    enabled: isManagement,
    queryFn: async () => (await apiClient.get('/api/v1/departments')).data
  });

  const { data: studentsData, isLoading: loadingStudents } = useQuery<PaginatedResponse<Student>>({
    queryKey: ['dashboard-students'],
    enabled: isManagement,
    queryFn: async () => (await apiClient.get('/api/v1/students', { params: { page: 0, size: 5 } })).data?.data
  });

  const { data: appsData, isLoading: loadingApps } = useQuery<Application[]>({
    queryKey: ['dashboard-apps'],
    enabled: isAdmin,
    queryFn: async () => (await apiClient.get('/api/v1/admission-applications')).data
  });

  if (!isManagement) {
    return (
      <PageFrame title="Dashboard" description="Welcome back.">
        <div className="flex h-64 items-center justify-center bg-white border border-slate-200">
          <p className="text-slate-500">Workspace redesign in progress for your role.</p>
        </div>
      </PageFrame>
    );
  }

  const activeUsers = usersData?.length || 0;
  const lockedUsers = 0;
  const totalDepts = departmentsData?.length || 0;
  const totalStudents = studentsData?.totalElements || 0;
  const pendingApps = appsData?.filter(a => a.status === 'SUBMITTED' || a.status === 'UNDER_REVIEW')?.length || 0;

  return (
    <PageFrame 
      title={isSuperAdmin ? "System Governance" : "Institutional Operations"} 
      description={isSuperAdmin ? "Monitor system health, access control, and master configuration." : "Overview of daily operations, admissions, and student activities."}
    >
      <div className="grid gap-px md:grid-cols-2 lg:grid-cols-4 mb-8 bg-slate-200 border border-slate-200">
        {isSuperAdmin && (
          <>
            <div className="bg-white p-5 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">System Users</h3>
                <ShieldAlert className="h-4 w-4 text-slate-400" />
              </div>
              <div className="text-3xl font-extrabold tracking-tight text-slate-900">{usersData ? usersData.length : '-'}</div>
              <p className="text-xs text-slate-500 mt-2 font-medium">{activeUsers} active, {lockedUsers} locked</p>
            </div>
            <div className="bg-white p-5 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Departments</h3>
                <Store className="h-4 w-4 text-slate-400" />
              </div>
              <div className="text-3xl font-extrabold tracking-tight text-slate-900">{departmentsData ? totalDepts : '-'}</div>
              <p className="text-xs text-slate-500 mt-2 font-medium">Configured Academic Programs</p>
            </div>
          </>
        )}

        {isAdmin && (
          <>
            <div className="bg-white p-5 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Students</h3>
                <Users className="h-4 w-4 text-slate-400" />
              </div>
              <div className="text-3xl font-extrabold tracking-tight text-slate-900">{studentsData ? totalStudents : '-'}</div>
              <p className="text-xs text-slate-500 mt-2 font-medium">Enrolled across all programs</p>
            </div>
            <div className="bg-white p-5 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending Admissions</h3>
                <UserCheck className="h-4 w-4 text-slate-400" />
              </div>
              <div className="text-3xl font-extrabold tracking-tight text-slate-900">{appsData ? pendingApps : '-'}</div>
              <p className="text-xs text-slate-500 mt-2 font-medium">Requires review or verification</p>
            </div>
          </>
        )}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Recent Enrollments</h3>
            <Link to="/dashboard/students" className="text-xs font-semibold text-slate-500 hover:text-primary">View Directory &rarr;</Link>
          </div>
          
          {loadingStudents ? (
            <div className="flex justify-center p-6"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
          ) : studentsData?.content && studentsData.content.length > 0 ? (
            <div className="divide-y divide-slate-100 border border-slate-200 bg-white">
              {studentsData.content.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 hover:bg-slate-50">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                      {s.firstName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{s.firstName} {s.lastName}</p>
                      <p className="text-[11px] font-medium text-slate-500">{s.rollNumber || 'Pending ID'}</p>
                    </div>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 border border-slate-200 bg-slate-50 text-center text-sm text-slate-500">
              No students found.
            </div>
          )}
        </div>

        {isSuperAdmin ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">System Access Log</h3>
            </div>
            {loadingUsers ? (
              <div className="flex justify-center p-6"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
            ) : usersData ? (
              <div className="border border-slate-200 bg-white">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2 font-semibold text-slate-600 text-[11px] uppercase tracking-wider">User</th>
                      <th className="px-4 py-2 font-semibold text-slate-600 text-[11px] uppercase tracking-wider text-right">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {usersData.slice(0, 5).map(u => (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">{u.username}</td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 bg-slate-100 px-2 py-1">{u.role.replace('ROLE_', '')}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 border border-slate-200 bg-slate-50 text-center text-sm text-slate-500">
                Could not load access data.
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Admissions Pipeline</h3>
              <Link to="/dashboard/admissions" className="text-xs font-semibold text-slate-500 hover:text-primary">Review Applications &rarr;</Link>
            </div>
            {loadingApps ? (
              <div className="flex justify-center p-6"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
            ) : appsData && appsData.length > 0 ? (
              <div className="divide-y divide-slate-100 border border-slate-200 bg-white">
                {appsData.filter(a => a.status === 'SUBMITTED' || a.status === 'UNDER_REVIEW').slice(0, 5).map(a => (
                  <div key={a.id} className="flex justify-between items-center p-3 hover:bg-slate-50">
                    <div>
                      <span className="font-semibold text-slate-900 block text-sm">{a.applicantName}</span>
                      <span className="text-[11px] font-medium text-slate-500">{a.programName || 'Unknown Program'}</span>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 border border-slate-200 bg-slate-50 text-center text-sm text-slate-500">
                No pending applications.
              </div>
            )}
          </div>
        )}
      </div>
    </PageFrame>
  );
}