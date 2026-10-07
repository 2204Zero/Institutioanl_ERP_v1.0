import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { 
  User, Users, Bell, Search, PlusCircle, ArrowUpRight, ArrowDownRight, 
  Loader2, BookOpen, GraduationCap, Calendar, Clock, CreditCard, CalendarCheck, Wallet, 
  Building2, MapPin, Briefcase, Store, ShieldAlert, FileText, CheckCircle
} from 'lucide-react';
import { apiClient } from '../config/api';
import { useQuery } from '@tanstack/react-query';
import type { PaginatedResponse, Student } from '../types/student';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const role = user?.role || '';

  const isAdmin = role === 'SUPER_ADMIN' || role === 'ADMIN';

  const { data: studentsData, isLoading, isError } = useQuery<PaginatedResponse<Student>>({
    queryKey: ['recent-students'],
    enabled: isAdmin,
    queryFn: async () => {
      const res = await apiClient.get('/students', {
        params: { page: 0, size: 5 }
      });
      return res.data?.data;
    }
  });

  const recentStudents = studentsData?.content || [];

  // ---------------------------------------------------------
  // 1. SUPER_ADMIN Dashboard
  // ---------------------------------------------------------
  if (role === 'SUPER_ADMIN') {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">System Overview</h1>
              <p className="text-slate-500 mt-1">Logged in as SUPER_ADMIN • EduPulse ERP</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-slate-500 text-sm font-medium">Total Students</div>
              <div className="text-xl font-bold text-slate-900 mt-1">{studentsData?.totalElements ?? 'Unavailable'}</div>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <div className="text-slate-500 text-sm font-medium">Faculty/Staff</div>
              <div className="text-sm font-semibold text-slate-400 mt-1">Data unavailable</div>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-slate-500 text-sm font-medium">Campuses</div>
              <div className="text-sm font-semibold text-slate-400 mt-1">Data unavailable</div>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="text-slate-500 text-sm font-medium">Active Users</div>
              <div className="text-sm font-semibold text-slate-400 mt-1">Data unavailable</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Requires Attention</h2>
            <div className="text-slate-500 text-sm py-8 text-center border-2 border-dashed border-slate-100 rounded-xl">
              No pending system issues or alerts.
            </div>
          </div>
          
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-900">Recent Enrollments</h2>
              <button onClick={() => navigate('/dashboard/students')} className="text-sm text-blue-600 hover:text-blue-700 font-semibold">View All</button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
              ) : isError ? (
                <div className="text-sm text-red-500 text-center py-4">Failed to load recent students.</div>
              ) : recentStudents.length === 0 ? (
                <div className="text-sm text-slate-500 text-center py-4">No recent enrollments.</div>
              ) : (
                recentStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between group cursor-pointer" onClick={() => navigate(`/dashboard/students/${student.id}`)}>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-sm">
                        {student.firstName[0]}{student.lastName[0]}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-xs text-slate-500">{student.department || 'Unassigned'}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // 2. ADMIN Dashboard
  // ---------------------------------------------------------
  if (role === 'ADMIN') {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Institutional Administration</h1>
          <p className="text-slate-500 mt-1">Manage institutional configuration and students.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-900">Student Activity</h2>
              <button onClick={() => navigate('/dashboard/students')} className="text-sm text-blue-600 hover:text-blue-700 font-semibold">Manage All</button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
              ) : isError ? (
                <div className="text-sm text-red-500 text-center py-4">Failed to load recent students.</div>
              ) : recentStudents.length === 0 ? (
                <div className="text-sm text-slate-500 text-center py-4 border-2 border-dashed border-slate-100 rounded-xl py-12">
                   <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                   No recent student updates available.
                </div>
              ) : (
                recentStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors" onClick={() => navigate(`/dashboard/students/${student.id}`)}>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-sm">
                        {student.firstName[0]}{student.lastName[0]}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-xs text-slate-500">{student.email || 'No Email'}</div>
                      </div>
                    </div>
                    <div className="text-xs font-semibold text-slate-400">
                      {student.status || 'ACTIVE'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Requires Attention</h2>
            <div className="text-slate-500 text-sm py-8 text-center border-2 border-dashed border-slate-100 rounded-xl">
              <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              No administrative items require attention.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // 3. FACULTY Dashboard
  // ---------------------------------------------------------
  if (role === 'FACULTY') {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Faculty Portal</h1>
          <p className="text-slate-500 mt-1">Manage your academic schedule and attendance.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-900">Today's Schedule</h2>
            </div>
            <div className="text-slate-500 text-sm py-12 text-center border-2 border-dashed border-slate-100 rounded-xl">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              No schedule data available for today.
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
            <button onClick={() => navigate('/dashboard/attendance')} className="w-full bg-black text-white font-semibold py-3 rounded-xl hover:bg-black/90 transition-colors mb-3 shadow-md">
              Take Attendance
            </button>
            <button onClick={() => navigate('/dashboard/attendance')} className="w-full bg-white border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-colors mb-3">
              View Attendance
            </button>
            <button onClick={() => navigate('/dashboard/students')} className="w-full bg-white border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-colors">
              View Students
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Classes Requiring Attendance</h2>
          <div className="text-slate-500 text-sm py-8 text-center border-2 border-dashed border-slate-100 rounded-xl">
            <CheckCircle className="w-8 h-8 text-green-300 mx-auto mb-2" />
            All attendance has been recorded.
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // 4. STUDENT & PARENT Dashboard
  // ---------------------------------------------------------
  if (role === 'STUDENT' || role === 'PARENT') {
    const isParent = role === 'PARENT';
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user?.username}!</h1>
          <p className="text-slate-500 mt-1">Here is the academic and financial status for {isParent ? 'your ward' : 'yourself'}.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="text-slate-500 text-sm font-medium">Profile Summary</div>
              <div className="text-sm font-semibold text-slate-400 mt-1">Data unavailable</div>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-slate-500 text-sm font-medium">Attendance</div>
              <div className="text-sm font-semibold text-slate-400 mt-1">Data unavailable</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <div className="text-slate-500 text-sm font-medium">Outstanding Fees</div>
              <div className="text-sm font-semibold text-slate-400 mt-1">Data unavailable</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Activity & Notifications</h2>
            <div className="text-slate-500 text-sm py-12 text-center border-2 border-dashed border-slate-100 rounded-xl">
              <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              No recent notifications.
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
            <button onClick={() => navigate('/dashboard')} className="w-full bg-white border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-colors mb-3">View Profile</button>
            <button onClick={() => navigate('/dashboard/attendance')} className="w-full bg-white border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-colors mb-3">View Attendance</button>
            <button onClick={() => navigate('/dashboard/finance')} className="w-full bg-white border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-colors">View Fees & Payment History</button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // 5. FINANCE Dashboard
  // ---------------------------------------------------------
  if (role === 'FINANCE') {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Finance Portal</h1>
          <p className="text-slate-500 mt-1">Manage fee structures, invoices, and payments.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Financial Overview</h2>
            <div className="text-slate-500 text-sm py-12 text-center border-2 border-dashed border-slate-100 rounded-xl">
              <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              No fee records available.
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
            <button onClick={() => navigate('/dashboard/finance')} className="w-full bg-black text-white font-semibold py-3 rounded-xl hover:bg-black/90 transition-colors mb-3 shadow-md">
              Create Invoice
            </button>
            <button onClick={() => navigate('/dashboard/finance')} className="w-full bg-white border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-colors mb-3">
              Manage Fee Structures
            </button>
            <button onClick={() => navigate('/dashboard/finance')} className="w-full bg-white border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-colors mb-3">
              View Payments
            </button>
            <button onClick={() => navigate('/dashboard/students')} className="w-full bg-white border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-colors">
              View Students
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Financial Activity</h2>
          <div className="text-slate-500 text-sm py-8 text-center border-2 border-dashed border-slate-100 rounded-xl">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            No recent financial activity recorded.
          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-slate-500">Please select an option from the sidebar.</p>
    </div>
  );
}



