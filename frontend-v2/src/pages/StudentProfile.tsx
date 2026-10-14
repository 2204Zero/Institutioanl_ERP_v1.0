import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { apiClient } from '../config/api';
import type { Student, StudentStatus } from '../types/student';
import type { GuardianResponseDto } from '../types/guardian';
import { 
  User, Mail, Phone, MapPin, Building2, Calendar, 
  BookOpen, MoreVertical, Edit, Loader2,
  AlertCircle, Download, FileText, CalendarCheck, Wallet, Clock,
  CreditCard, Copy, Check, Eye, ArrowUpRight, Pencil,
  Camera, Upload, Trash2, Plus
} from 'lucide-react';
import { PageFrame } from '../components/ui/PageFrame';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { StudentAcademicTab } from '../components/StudentAcademicTab';
import { StudentFeesTab } from '../components/StudentFeesTab';
import { StudentStatusHistoryTab } from '../components/StudentStatusHistoryTab';
import { ChangeStudentStatusDialog } from '../components/ChangeStudentStatusDialog';
import { StudentIdCardModal } from '../components/StudentIdCardModal';
import { StudentTranscriptModal } from '../components/StudentTranscriptModal';
import { EditStudentDialog } from '../components/EditStudentDialog';
import { EditGuardianDialog } from '../components/EditGuardianDialog';

const VALID_TRANSITIONS: Record<StudentStatus, { status: StudentStatus; label: string; className?: string }[]> = {
  ACTIVE: [
    { status: 'SUSPENDED', label: 'Suspend Enrollment', className: 'text-amber-600' },
    { status: 'INACTIVE', label: 'Mark Inactive', className: 'text-slate-600' },
    { status: 'GRADUATED', label: 'Mark as Graduated', className: 'text-emerald-600' },
    { status: 'DROPPED', label: 'Withdraw / Drop', className: 'text-red-600' },
    { status: 'TRANSFERRED', label: 'Transfer Out', className: 'text-blue-600' },
  ],
  SUSPENDED: [
    { status: 'ACTIVE', label: 'Reinstate to Active', className: 'text-emerald-600 font-semibold' },
    { status: 'DROPPED', label: 'Withdraw / Drop', className: 'text-red-600' },
    { status: 'TRANSFERRED', label: 'Transfer Out', className: 'text-blue-600' },
  ],
  INACTIVE: [
    { status: 'ACTIVE', label: 'Reactivate to Active', className: 'text-emerald-600 font-semibold' },
    { status: 'DROPPED', label: 'Withdraw / Drop', className: 'text-red-600' },
    { status: 'TRANSFERRED', label: 'Transfer Out', className: 'text-blue-600' },
  ],
  GRADUATED: [
    { status: 'ALUMNI', label: 'Transition to Alumni', className: 'text-purple-600 font-bold' },
  ],
  ALUMNI: [],
  DROPPED: [],
  TRANSFERRED: [],
};

function formatDateDisplay(val: any): string {
  if (!val) return 'N/A';
  if (Array.isArray(val) && val.length >= 3) {
    const [y, m, d] = val;
    return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  const d = new Date(val);
  return isNaN(d.getTime()) ? String(val) : d.toLocaleDateString();
}

export default function StudentProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const canManage = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  const [activeTab, setActiveTab] = useState<'overview' | 'academic' | 'attendance' | 'fees' | 'documents' | 'history'>('overview');
  const [selectedTargetStatus, setSelectedTargetStatus] = useState<StudentStatus | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingGuardian, setEditingGuardian] = useState<any | null>(null);
  const [isIdCardModalOpen, setIsIdCardModalOpen] = useState(false);
  const [isTranscriptModalOpen, setIsTranscriptModalOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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

  const { data: documentsResponse, isLoading: isLoadingDocs } = useQuery({
    queryKey: ['student-documents', id],
    queryFn: async () => {
      const res = await apiClient.get(`/api/v1/students/${id}/documents`);
      return res.data?.data || [];
    },
    enabled: !!id && activeTab === 'documents'
  });

  const { data: attendanceRecords = [], isLoading: isLoadingAttendance } = useQuery({
    queryKey: ['student-attendance', id],
    queryFn: async () => {
      const res = await apiClient.get(`/api/v1/attendance/student/${id}`);
      return res.data || [];
    },
    enabled: !!id && activeTab === 'attendance'
  });

  const guardians: GuardianResponseDto[] = guardiansResponse?.data || [];
  const documents: any[] = documentsResponse || [];

  const queryClient = useQueryClient();
  const [photoTimestamp, setPhotoTimestamp] = useState<number>(Date.now());
  const [photoError, setPhotoError] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Document upload state
  const [isUploadDocOpen, setIsUploadDocOpen] = useState(false);
  const [uploadDocType, setUploadDocType] = useState('TENTH_MARKSHEET');
  const [uploadDocFile, setUploadDocFile] = useState<File | null>(null);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    toast.success(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files (JPEG, PNG, WebP) are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Photo size exceeds 5MB limit');
      return;
    }

    setIsUploadingPhoto(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      await apiClient.post(`/api/v1/students/${id}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Profile photo updated successfully!');
      setPhotoTimestamp(Date.now());
      setPhotoError(false);
      queryClient.invalidateQueries({ queryKey: ['student', id] });
      queryClient.invalidateQueries({ queryKey: ['student-documents', id] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload photo');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handlePhotoDelete = async () => {
    if (!window.confirm('Are you sure you want to remove the profile photograph?')) return;
    try {
      await apiClient.delete(`/api/v1/students/${id}/photo`);
      toast.success('Profile photograph removed');
      setPhotoError(true);
      setPhotoTimestamp(Date.now());
      queryClient.invalidateQueries({ queryKey: ['student', id] });
      queryClient.invalidateQueries({ queryKey: ['student-documents', id] });
    } catch (err: any) {
      toast.error('Failed to remove photo');
    }
  };

  const handleUploadDocument = async () => {
    if (!uploadDocFile) {
      toast.error('Please choose a file to upload');
      return;
    }
    setIsUploadingDoc(true);
    const formData = new FormData();
    formData.append('documentType', uploadDocType);
    formData.append('file', uploadDocFile);
    try {
      await apiClient.post(`/api/v1/students/${id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Document uploaded successfully!');
      setIsUploadDocOpen(false);
      setUploadDocFile(null);
      queryClient.invalidateQueries({ queryKey: ['student-documents', id] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleDeleteDocument = async (docId: number) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await apiClient.delete(`/api/v1/documents/${docId}`);
      toast.success('Document deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['student-documents', id] });
    } catch (err: any) {
      toast.error('Failed to delete document');
    }
  };

  if (isLoading) {
    return (
      <PageFrame title="Student Profile" breadcrumbs={[{ label: 'Students', href: '/dashboard/students' }, { label: 'Loading...' }]}>
        <div className="flex justify-center p-12 border border-slate-200 bg-white"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>
      </PageFrame>
    );
  }

  if (isError || !student) {
    return (
      <PageFrame title="Student Not Found" breadcrumbs={[{ label: 'Students', href: '/dashboard/students' }, { label: 'Not Found' }]}>
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200">
          <AlertCircle className="h-10 w-10 text-amber-500 mb-3" />
          <h2 className="text-sm font-bold text-slate-900 uppercase">Student Record Not Found</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-md text-center">
            The requested student record (#{id}) could not be found or you do not have permission to view it.
          </p>
          <Button onClick={() => navigate('/dashboard/students')} variant="outline" size="sm" className="mt-4">
            Return to Directory
          </Button>
        </div>
      </PageFrame>
    );
  }

  const validOptions = VALID_TRANSITIONS[student.status] || [];

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
      description={
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1">
          <div className="flex items-center space-x-1 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            <span className="text-slate-500 text-[10px] uppercase font-sans font-bold">Internal ID:</span>
            <span className="font-bold text-slate-900">#{student.id}</span>
            <button
              onClick={() => copyToClipboard(String(student.id), 'Student ID')}
              className="text-slate-400 hover:text-slate-800 ml-1"
              title="Copy Student ID"
            >
              {copiedKey === 'Student ID' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>

          <div className="flex items-center space-x-1 font-mono bg-blue-50 text-blue-900 px-2 py-0.5 rounded border border-blue-200">
            <span className="text-blue-700 text-[10px] uppercase font-sans font-bold">Canonical ENR:</span>
            <span className="font-bold">{student.enrollmentNumber || 'Pending'}</span>
            {student.enrollmentNumber && (
              <button
                onClick={() => copyToClipboard(student.enrollmentNumber!, 'Enrollment Number')}
                className="text-blue-500 hover:text-blue-900 ml-1"
                title="Copy Enrollment Number"
              >
                {copiedKey === 'Enrollment Number' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
            )}
          </div>

          <div className="flex items-center space-x-1 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            <span className="text-slate-500 text-[10px] uppercase font-sans font-bold">Roll No:</span>
            <span className="font-semibold text-slate-800">{student.rollNumber || 'None'}</span>
            {student.rollNumber && (
              <button
                onClick={() => copyToClipboard(student.rollNumber, 'Roll Number')}
                className="text-slate-400 hover:text-slate-800 ml-1"
                title="Copy Roll Number"
              >
                {copiedKey === 'Roll Number' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
            )}
          </div>
        </div>
      }
      breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Students', href: '/dashboard/students' }, { label: student.firstName }]}
      actions={
        <div className="flex items-center space-x-2">
          <StatusBadge status={student.status} />
          
          {canManage && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs font-semibold bg-white hover:bg-slate-50 border-slate-300"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Edit className="w-3.5 h-3.5 mr-1 text-slate-600" /> Edit Profile
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 text-xs font-semibold">
                    <MoreVertical className="w-3.5 h-3.5 mr-1" /> Options
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 text-xs bg-white border border-slate-200 shadow-md">
                  <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-slate-500">
                    Manage Lifecycle Status
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {validOptions.length > 0 ? (
                    validOptions.map((opt) => (
                      <DropdownMenuItem
                        key={opt.status}
                        className={`cursor-pointer ${opt.className || ''}`}
                        onClick={() => {
                          setSelectedTargetStatus(opt.status);
                          setIsStatusDialogOpen(true);
                        }}
                      >
                        {opt.label}
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <DropdownMenuItem disabled className="text-slate-400 italic">
                      Terminal Status (No Transitions)
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" onClick={() => setIsEditDialogOpen(true)}>
                    <Edit className="w-3.5 h-3.5 mr-2" /> Edit Profile
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
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
                    <p className="font-semibold text-slate-900 mt-0.5">{formatDateDisplay(student.dateOfBirth)}</p>
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
                      <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                      <span>{student.address ? `${student.address}, ${student.city || ''}, ${student.state || ''} ${student.pincode || ''}` : 'Not provided'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 bg-white">
                <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Associated Guardians</h3>
                  <span className="text-[10px] font-semibold text-slate-500">{guardians.length} Registered</span>
                </div>
                {guardians.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {guardians.map((g) => (
                      <div key={g.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs uppercase">
                            {(g.firstName?.[0] || '') + (g.lastName?.[0] || '') || 'G'}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-xs">{g.firstName} {g.lastName}</p>
                            <p className="text-[10px] text-slate-500 font-medium">{g.relation} • {g.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <p className="text-xs font-semibold text-slate-700">{g.phone || 'No phone'}</p>
                            {g.occupation && <p className="text-[10px] text-slate-400">{g.occupation}</p>}
                          </div>
                          {canManage && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-7 px-2 border-slate-200 text-slate-600 hover:text-slate-900 ml-2"
                              onClick={() => setEditingGuardian(g)}
                            >
                              <Pencil className="w-3 h-3 mr-1" /> Edit
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No guardian records linked to this student profile yet.
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'academic' && (
            <StudentAcademicTab studentId={Number(id)} />
          )}

          {activeTab === 'fees' && (
            <StudentFeesTab studentId={Number(id)} />
          )}

          {activeTab === 'history' && (
            <StudentStatusHistoryTab studentId={Number(id)} />
          )}

          {activeTab === 'attendance' && (
            <div className="border border-slate-200 bg-white">
              <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Classroom Attendance Roster</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Verified session attendance records for this student</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Link 
                    to="/dashboard/attendance"
                    className="inline-flex items-center text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded hover:bg-slate-50 transition-colors shadow-xs"
                  >
                    Attendance Workspace <ArrowUpRight className="w-3.5 h-3.5 ml-1 text-slate-500" />
                  </Link>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded">
                    {attendanceRecords.length} Sessions
                  </span>
                </div>
              </div>

              {/* Attendance Quick Metrics */}
              {attendanceRecords.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50/50 border-b border-slate-100">
                  <div className="p-2.5 bg-white border border-slate-200 rounded">
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Attendance Rate</p>
                    <p className="text-lg font-black text-slate-900 mt-0.5">
                      {Math.round((attendanceRecords.filter((r: any) => r.status === 'PRESENT').length / attendanceRecords.length) * 100)}%
                    </p>
                  </div>
                  <div className="p-2.5 bg-white border border-slate-200 rounded">
                    <p className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Present</p>
                    <p className="text-lg font-black text-emerald-700 mt-0.5">
                      {attendanceRecords.filter((r: any) => r.status === 'PRESENT').length}
                    </p>
                  </div>
                  <div className="p-2.5 bg-white border border-slate-200 rounded">
                    <p className="text-[10px] uppercase font-bold text-rose-600 tracking-wider">Absent</p>
                    <p className="text-lg font-black text-rose-700 mt-0.5">
                      {attendanceRecords.filter((r: any) => r.status === 'ABSENT').length}
                    </p>
                  </div>
                  <div className="p-2.5 bg-white border border-slate-200 rounded">
                    <p className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">Late / Excused</p>
                    <p className="text-lg font-black text-amber-700 mt-0.5">
                      {attendanceRecords.filter((r: any) => r.status === 'LATE' || r.status === 'EXCUSED').length}
                    </p>
                  </div>
                </div>
              )}

              <div className="p-4">
                {isLoadingAttendance ? (
                  <div className="py-10 flex justify-center items-center">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                  </div>
                ) : attendanceRecords.length === 0 ? (
                  <div className="py-10 text-center bg-slate-50 border border-dashed border-slate-200 rounded">
                    <CalendarCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-700">No attendance records found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Sessions marked by faculty will appear here automatically.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-semibold">
                        <tr>
                          <th className="px-3 py-2.5">Date</th>
                          <th className="px-3 py-2.5">Subject / Course</th>
                          <th className="px-3 py-2.5">Status</th>
                          <th className="px-3 py-2.5">Marked By</th>
                          <th className="px-3 py-2.5">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {attendanceRecords.map((rec: any) => {
                          const statusColor = 
                            rec.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            rec.status === 'ABSENT' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            rec.status === 'LATE' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-slate-100 text-slate-700 border-slate-200';
                          return (
                            <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="px-3 py-2.5 font-mono text-slate-900 font-medium">
                                {rec.date || rec.attendanceDate || '—'}
                              </td>
                              <td className="px-3 py-2.5 font-medium text-slate-800">
                                {rec.courseCode || 'General Lecture'}
                              </td>
                              <td className="px-3 py-2.5">
                                <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${statusColor}`}>
                                  {rec.status}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 text-slate-600">
                                {rec.markedBy || 'Faculty'}
                              </td>
                              <td className="px-3 py-2.5 text-slate-400 italic">
                                {rec.remarks || '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="border border-slate-200 bg-white">
              <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Persisted Student Documents</h3>
                  <span className="text-[10px] font-semibold text-slate-500">{documents.length} Records</span>
                </div>
                {canManage && (
                  <Button
                    size="sm"
                    className="h-7 text-xs bg-black text-white hover:bg-slate-800"
                    onClick={() => setIsUploadDocOpen(true)}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Upload Document
                  </Button>
                )}
              </div>
              <div className="p-4">
                {isLoadingDocs ? (
                  <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
                ) : documents.length > 0 ? (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded">
                    {documents.map((doc: any) => (
                      <div key={doc.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-slate-500 shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-slate-900">{doc.originalFileName}</p>
                            <p className="text-[10px] text-slate-500 font-medium">
                              Type: <span className="font-semibold text-slate-700">{doc.documentType}</span> • Uploaded: {new Date(doc.uploadDate).toLocaleDateString()} • {Math.round(doc.fileSize / 1024)} KB
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <a
                            href={`/api/v1/documents/${doc.id}/view`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 px-2 py-1 border border-slate-200 rounded hover:bg-white inline-flex items-center"
                          >
                            <Eye className="w-3 h-3 mr-1" /> View
                          </a>
                          <a
                            href={`/api/v1/documents/${doc.id}/download`}
                            className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 px-2 py-1 border border-slate-200 rounded hover:bg-white inline-flex items-center"
                          >
                            <Download className="w-3 h-3 mr-1" /> Download
                          </a>
                          {canManage && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-[11px] text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteDocument(doc.id)}
                            >
                              <Trash2 className="w-3 h-3 mr-1" /> Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500 text-xs border border-dashed border-slate-300 bg-slate-50">
                    No documents currently uploaded for this student record. Documents uploaded via verification or onboarding will appear here.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Profile Photo Card */}
          <div className="border border-slate-200 bg-white p-5 flex flex-col items-center text-center">
            <div className="relative group w-32 h-32 rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-100 flex items-center justify-center shadow-xs">
              {!photoError ? (
                <img
                  src={`/api/v1/students/${student.id}/photo?t=${photoTimestamp}`}
                  alt={`${student.firstName} ${student.lastName}`}
                  className="w-full h-full object-cover"
                  onError={() => setPhotoError(true)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white font-bold text-2xl uppercase tracking-wider">
                  <span>{student.firstName[0]}{student.lastName[0]}</span>
                </div>
              )}

              {canManage && (
                <label className="absolute inset-0 bg-black/50 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-semibold">Change Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={isUploadingPhoto}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="mt-3">
              <h3 className="font-bold text-sm text-slate-900">{student.firstName} {student.lastName}</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{student.enrollmentNumber || 'ENR Pending'}</p>
            </div>

            {canManage && (
              <div className="flex items-center gap-2 mt-4">
                <label className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer">
                  <Upload className="w-3 h-3 mr-1" />
                  {isUploadingPhoto ? 'Uploading...' : 'Upload'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={isUploadingPhoto}
                    className="hidden"
                  />
                </label>
                {!photoError && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handlePhotoDelete}
                  >
                    <Trash2 className="w-3 h-3 mr-1" /> Remove
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="border border-slate-200 bg-white">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Academic Placement</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-start space-x-3">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Department</p>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{student.department || 'Not assigned'}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <BookOpen className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Program / Degree</p>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{student.program || 'General Academic'}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Batch Cohort</p>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{student.batch || 'Current'}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Enrolled On</p>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{formatDateDisplay(student.enrollmentDate)}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border border-slate-200 bg-white">
             <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
               <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Quick Document Actions</h3>
             </div>
             <div className="p-2 space-y-1">
                <button 
                  className="w-full flex items-center px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  onClick={() => setIsIdCardModalOpen(true)}
                >
                  <CreditCard className="w-3.5 h-3.5 mr-2 text-slate-500" /> Generate Official ID Card
                </button>
                <button 
                  className="w-full flex items-center px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  onClick={() => setIsTranscriptModalOpen(true)}
                >
                  <Download className="w-3.5 h-3.5 mr-2 text-slate-500" /> Export Academic Transcript
                </button>
             </div>
          </div>
        </div>
      </div>

      <ChangeStudentStatusDialog
        open={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
        studentId={student.id}
        studentName={`${student.firstName} ${student.lastName}`}
        currentStatus={student.status}
        targetStatus={selectedTargetStatus}
      />

      <StudentIdCardModal
        studentId={student.id}
        open={isIdCardModalOpen}
        onOpenChange={setIsIdCardModalOpen}
      />

      <StudentTranscriptModal
        studentId={student.id}
        open={isTranscriptModalOpen}
        onOpenChange={setIsTranscriptModalOpen}
      />

      <EditStudentDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        student={student}
      />

      {editingGuardian && (
        <EditGuardianDialog
          open={!!editingGuardian}
          onOpenChange={(open) => { if (!open) setEditingGuardian(null); }}
          guardian={editingGuardian}
          studentId={student.id}
        />
      )}

      {/* Upload Document Dialog */}
      <Dialog open={isUploadDocOpen} onOpenChange={setIsUploadDocOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Upload Student Document</DialogTitle>
            <DialogDescription>
              Select the document type and attach a PDF or image file (max 10MB).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Document Category</label>
              <Select value={uploadDocType} onValueChange={setUploadDocType}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TENTH_MARKSHEET">10th Marksheet / Certificate</SelectItem>
                  <SelectItem value="TWELFTH_MARKSHEET">12th Marksheet / Diploma</SelectItem>
                  <SelectItem value="TRANSFER_CERTIFICATE">Transfer Certificate (TC)</SelectItem>
                  <SelectItem value="MIGRATION_CERTIFICATE">Migration Certificate</SelectItem>
                  <SelectItem value="AADHAAR_CARD">Aadhaar / Government ID</SelectItem>
                  <SelectItem value="PHOTOGRAPH">Profile Photograph</SelectItem>
                  <SelectItem value="OTHER">Other Institutional Document</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Choose File</label>
              <Input
                type="file"
                onChange={(e) => setUploadDocFile(e.target.files?.[0] || null)}
                className="text-xs cursor-pointer"
              />
              {uploadDocFile && (
                <p className="text-[11px] text-emerald-600 mt-1 font-medium">
                  Selected: {uploadDocFile.name} ({Math.round(uploadDocFile.size / 1024)} KB)
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsUploadDocOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-black text-white hover:bg-slate-800 text-xs"
              disabled={!uploadDocFile || isUploadingDoc}
              onClick={handleUploadDocument}
            >
              {isUploadingDoc && <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />}
              {isUploadingDoc ? 'Uploading...' : 'Upload File'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageFrame>
  );
}