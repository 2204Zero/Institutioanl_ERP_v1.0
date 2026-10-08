import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { apiClient } from '../config/api';
import type { Student } from '../types/student';
import type { GuardianResponseDto } from '../types/guardian';
import { 
  User, Mail, Phone, MapPin, Building2, Calendar, 
  BookOpen, MoreVertical, Edit, ShieldAlert, HeartHandshake, Loader2,
  AlertCircle, Download, FileText, CalendarCheck, Wallet, Clock
} from 'lucide-react';
import { PageFrame } from '../components/ui/PageFrame';
import { Button } from '../components/ui/button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

export default function StudentProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const canManage = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'overview' | 'academic' | 'attendance' | 'fees' | 'documents' | 'history'>('overview');

  const { data: student, isLoading, isError } = useQuery<Student>({
    queryKey: ['student', id],
    queryFn: async () => {
      const res = await apiClient.get(`/api/v1/students/${id}`);
      return res.data?.data;
    }
  });

  const { data: guardiansResponse } = useQuery({
    queryKey: ['student-guardians', id],
    queryFn: async () => {
      const res = await apiClient.get(`/api/v1/students/${id}/guardians`);
      return res.data;
    },
    enabled: !!id
  });

  const guardians: GuardianResponseDto[] = guardiansResponse?.data || [];

  const statusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const res = await apiClient.patch(`/api/v1/students/${id}/status`, { status: newStatus, remarks: 'Updated via portal' });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['student', id] });
    },
    onError: () => {
      toast.error('Failed to update status');
    }
  });

  if (isLoading) {
    return (
      <PageFrame title="Student Profile" breadcrumbs={[{ label: 'Students', href: '/dashboard/students' }, { label: 'Loading...' }]}>
        <div className="flex justify-center p-12 border border-slate-200 bg-white"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>
      </PageFrame>
    );
  }

  if (isError || !student) {
    return (
      <PageFrame title="Student Not Found" breadcrumbs={[{ label: 'Students', href: '/dashboard/students' }, { label: 'Error' }]}>
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200">
          <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
          <h2 className="text-sm font-bold text-slate-900 uppercase">Failed to load student</h2>
          <p className="text-xs text-slate-500 mt-1">The student record may have been deleted or you don't have permission to view it.</p>
          <Button onClick={() => navigate('/dashboard/students')} variant="outline" size="sm" className="mt-4">Return to Directory</Button>
        </div>
      </PageFrame>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'academic', label: 'Academic', icon: BookOpen },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'fees', label: 'Fees & Finance', icon: Wallet },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'history', label: 'Audit History', icon: Clock },
  ];

  return (
    <PageFrame
      title={`${student.firstName} ${student.lastName}`}
      description={student.rollNumber ? `ID: ${student.rollNumber}` : 'Pending Enrollment ID'}
      breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Students', href: '/dashboard/students' }, { label: student.firstName }]}
      actions={
        <div className="flex items-center space-x-3">
          <StatusBadge status={student.status} />
          
          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs font-semibold">
                  <MoreVertical className="w-3.5 h-3.5 mr-1" /> Options
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 text-xs">
                <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-slate-500">Manage Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => statusMutation.mutate('ACTIVE')}>Mark Active</DropdownMenuItem>
                <DropdownMenuItem onClick={() => statusMutation.mutate('SUSPENDED')} className="text-orange-600">Suspend</DropdownMenuItem>
                <DropdownMenuItem onClick={() => statusMutation.mutate('DROPPED')} className="text-red-600">Drop</DropdownMenuItem>
                <DropdownMenuItem onClick={() => statusMutation.mutate('GRADUATED')} className="text-emerald-600">Graduated</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => toast.info('Edit student functionality coming soon')}>
                  <Edit className="w-3.5 h-3.5 mr-2" /> Edit Profile
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      }
    >
      <div className="border-b border-slate-200 mb-6 flex overflow-x-auto hide-scrollbar">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-1.5 px-4 py-2.5 border-b-2 text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
                isActive 
                  ? 'border-slate-900 text-slate-900' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'overview' && (
            <>
              <div className="border border-slate-200 bg-white">
                <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Personal Information</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2">
                  <div className="p-4 border-b sm:border-b-0 sm:border-r border-slate-200/50">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Date of Birth</p>
                    <p className="font-semibold text-slate-900 mt-0.5">{student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div className="p-4 border-b sm:border-b-0 border-slate-200/50">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Gender</p>
                    <p className="font-semibold text-slate-900 mt-0.5">{student.gender || 'N/A'}</p>
                  </div>
                  <div className="p-4 border-b sm:border-r sm:border-t border-slate-200/50">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Email Address</p>
                    <div className="flex items-center space-x-1.5 text-slate-900 font-semibold mt-0.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{student.email || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="p-4 border-b sm:border-t border-slate-200/50">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Phone Number</p>
                    <div className="flex items-center space-x-1.5 text-slate-900 font-semibold mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{student.phone || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="sm:col-span-2 p-4 border-t border-slate-200/50">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Address</p>
                    <div className="flex items-start space-x-1.5 text-slate-900 font-semibold mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{student.address || 'Address not provided'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 bg-white">
                <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Guardian Information</h3>
                </div>
                <div>
                  {guardians.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {guardians.map(g => (
                        <div key={g.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <HeartHandshake className="w-4 h-4 text-slate-400" />
                              <span className="font-bold text-slate-900">{g.firstName} {g.lastName}</span>
                              <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-900 text-white px-2 py-0.5">{g.relation}</span>
                            </div>
                            <div className="flex space-x-4 pl-6">
                              <p className="text-xs font-medium text-slate-600 flex items-center"><Phone className="w-3 h-3 mr-1"/>{g.phone}</p>
                              {g.email && <p className="text-xs font-medium text-slate-600 flex items-center"><Mail className="w-3 h-3 mr-1"/>{g.email}</p>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-500 text-xs italic">
                      No guardians registered for this student.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {(activeTab === 'academic' || activeTab === 'attendance' || activeTab === 'fees' || activeTab === 'history') && (
            <div className="flex flex-col items-center justify-center p-12 bg-slate-50 border border-slate-200">
               <div className="w-10 h-10 bg-slate-200 flex items-center justify-center mb-3">
                 <ShieldAlert className="w-5 h-5 text-slate-400" />
               </div>
               <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Module Unreachable</h3>
               <p className="text-slate-500 text-xs text-center max-w-sm mt-1">
                 This module will be connected to the new APIs in the upcoming phases. The UI layout foundation is ready.
               </p>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="border border-slate-200 bg-white">
              <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Uploaded Documents</h3>
              </div>
              <div className="p-4">
                 <div className="text-center py-8 text-slate-500 text-xs border border-dashed border-slate-300 bg-slate-50">
                    Document integration coming soon.
                 </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="border border-slate-200 bg-white">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Current Program</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-start space-x-3">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Department</p>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{student.department ? `Dept ID: ${student.department}` : 'Not assigned'}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Enrolled On</p>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border border-slate-200 bg-white">
             <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
               <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Quick Actions</h3>
             </div>
             <div className="p-2 space-y-1">
                <button 
                  className="w-full flex items-center px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  onClick={() => toast.info('Generate ID Card coming soon')}
                >
                  <User className="w-3.5 h-3.5 mr-2 text-slate-400" /> Generate ID Card
                </button>
                <button 
                  className="w-full flex items-center px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  onClick={() => toast.info('Export transcript coming soon')}
                >
                  <Download className="w-3.5 h-3.5 mr-2 text-slate-400" /> Export Transcript
                </button>
             </div>
          </div>
        </div>
      </div>
    </PageFrame>
  );
}