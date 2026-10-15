import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { apiClient } from '../config/api';
import { PageFrame } from '../components/ui/PageFrame';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { StatusBadge } from '../components/ui/StatusBadge';
import { 
  GraduationCap, 
  FileText, 
  HelpCircle, 
  PlusCircle, 
  UploadCloud, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  KeyRound,
  Copy,
  ArrowUpRight,
  User,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { formatAcademicYearLabel } from '../lib/academicUtils';

interface ApplicantProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
}

interface ApplicationItem {
  id: number;
  applicationNumber: string;
  applicantId: number;
  programId: number;
  academicYearId: number;
  programName?: string;
  programCode?: string;
  academicYearName?: string;
  status: string;
  submissionDate?: string;
  submittedAt?: string;
  createdAt?: string;
  remarks?: string;
}

interface InquiryItem {
  id: number;
  inquiryNumber?: string;
  prospectName: string;
  email: string;
  phone: string;
  programOfInterest?: string;
  notes?: string;
  status: string;
  replyMessage?: string;
  createdAt?: string;
}

interface AccountAccessSummary {
  applicationId: number;
  studentId?: number;
  studentEnrollmentNumber?: string;
  studentLoginIdentifier?: string;
  studentEmail?: string;
  studentStatus?: string;
  studentOneTimeSecretAvailable: boolean;
  guardianName?: string;
  guardianRelation?: string;
  guardianLoginIdentifier?: string;
  guardianEmail?: string;
  guardianStatus?: string;
  guardianOneTimeSecretAvailable: boolean;
}

interface ApplicantDashboardData {
  applicant: ApplicantProfile;
  username: string;
  applications: ApplicationItem[];
  inquiries: InquiryItem[];
  isEnrolled: boolean;
  enrollmentNumber?: string;
  studentId?: number;
  accountAccess?: AccountAccessSummary;
}

export default function ApplicantDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);

  const [activeTab, setActiveTab] = useState<'applications' | 'inquiries'>('applications');
  const [isNewAppOpen, setIsNewAppOpen] = useState(false);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [selectedAppForUpload, setSelectedAppForUpload] = useState<ApplicationItem | null>(null);

  // Form states for new application
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState('');
  const [appRemarks, setAppRemarks] = useState('');

  // Form states for inquiry
  const [inquiryProgram, setInquiryProgram] = useState('');
  const [inquiryNotes, setInquiryNotes] = useState('');

  // Form states for document upload
  const [docType, setDocType] = useState('PHOTOGRAPH');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Fetch applicant dashboard data
  const { data: dashboard, isLoading, error } = useQuery<ApplicantDashboardData>({
    queryKey: ['applicant-dashboard'],
    queryFn: async () => {
      const res = await apiClient.get<ApplicantDashboardData>('/api/v1/admissions/public/applicant/dashboard');
      return res.data;
    },
  });

  // Fetch programs for application dropdown
  const { data: programs = [] } = useQuery<any[]>({
    queryKey: ['public-programs'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/admissions/public/programs');
      return Array.isArray(res.data) ? res.data : (res.data?.data || []);
    },
  });

  // Fetch academic years for application dropdown
  const { data: academicYears = [] } = useQuery<any[]>({
    queryKey: ['public-academic-years'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/admissions/public/academic-years');
      return Array.isArray(res.data) ? res.data : (res.data?.data || []);
    },
  });

  // Submit formal application mutation
  const submitAppMutation = useMutation({
    mutationFn: async (payload: { programId: number; academicYearId: number; remarks?: string }) => {
      const res = await apiClient.post('/api/v1/admissions/public/applicant/applications', payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(`Application ${data.applicationNumber || ''} submitted successfully!`);
      setIsNewAppOpen(false);
      setSelectedProgramId('');
      setSelectedAcademicYearId('');
      setAppRemarks('');
      queryClient.invalidateQueries({ queryKey: ['applicant-dashboard'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to submit application. Please check program selection.');
    },
  });

  // Submit authenticated inquiry mutation
  const submitInquiryMutation = useMutation({
    mutationFn: async (payload: { programOfInterest?: string; notes: string }) => {
      const res = await apiClient.post('/api/v1/admissions/public/applicant/inquiries', payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Inquiry submitted to admissions office!');
      setIsInquiryOpen(false);
      setInquiryProgram('');
      setInquiryNotes('');
      queryClient.invalidateQueries({ queryKey: ['applicant-dashboard'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to submit inquiry.');
    },
  });

  // Upload document handler
  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppForUpload || !docFile) {
      toast.error('Please choose a file to upload.');
      return;
    }
    setUploadingDoc(true);
    try {
      const fd = new FormData();
      fd.append('documentType', docType);
      fd.append('file', docFile);
      await apiClient.post(`/api/v1/admissions/public/applications/${selectedAppForUpload.id}/documents`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(`${docType.replace(/_/g, ' ')} uploaded successfully!`);
      setSelectedAppForUpload(null);
      setDocFile(null);
      queryClient.invalidateQueries({ queryKey: ['applicant-dashboard'] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload document.');
    } finally {
      setUploadingDoc(false);
    }
  };

  const [revealedCredentials, setRevealedCredentials] = useState<{
    studentTemporaryPassword?: string;
    guardianTemporaryPassword?: string;
    message?: string;
    alreadyConsumed?: boolean;
  } | null>(null);
  const [revealingPassword, setRevealingPassword] = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard!`);
  };

  const handleDiscloseCredentials = async (appId: number) => {
    setRevealingPassword(true);
    try {
      const res = await apiClient.post(`/api/v1/admissions/public/applicant/applications/${appId}/disclose-credentials`);
      setRevealedCredentials(res.data);
      queryClient.invalidateQueries({ queryKey: ['applicant-dashboard'] });
      if (res.data.alreadyConsumed) {
        toast.info(res.data.message || 'Credentials already disclosed.');
      } else {
        toast.success('Initial temporary credentials revealed. Please save them immediately.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to disclose credentials.');
    } finally {
      setRevealingPassword(false);
    }
  };

  const rawApplications = dashboard?.applications;
  const rawInquiries = dashboard?.inquiries;

  const sortedApplications = useMemo(() => {
    if (!rawApplications || !Array.isArray(rawApplications)) return [];
    return [...rawApplications].sort((a, b) => {
      const timeA = (a.submittedAt ? new Date(a.submittedAt).getTime() : 0) ||
                    (a.createdAt ? new Date(a.createdAt).getTime() : 0) ||
                    (a.submissionDate ? new Date(a.submissionDate).getTime() : 0);
      const timeB = (b.submittedAt ? new Date(b.submittedAt).getTime() : 0) ||
                    (b.createdAt ? new Date(b.createdAt).getTime() : 0) ||
                    (b.submissionDate ? new Date(b.submissionDate).getTime() : 0);
      if (timeB !== timeA) return timeB - timeA;
      return (b.id || 0) - (a.id || 0);
    });
  }, [rawApplications]);

  const sortedInquiries = useMemo(() => {
    if (!rawInquiries || !Array.isArray(rawInquiries)) return [];
    return [...rawInquiries].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (timeB !== timeA) return timeB - timeA;
      return (b.id || 0) - (a.id || 0);
    });
  }, [rawInquiries]);

  if (isLoading) {
    return (
      <PageFrame title="Applicant Portal" description="Loading your admissions status...">
        <div className="flex h-64 items-center justify-center">
          <Clock className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageFrame>
    );
  }

  if (error || !dashboard) {
    return (
      <PageFrame title="Applicant Portal" description="Admission profile error">
        <div className="p-8 text-center bg-white border border-slate-200 rounded-xl space-y-3">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <h2 className="text-base font-bold text-slate-800">No Applicant Profile Found</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            We could not find an associated applicant record for your account. If you registered recently, please submit an inquiry or apply online.
          </p>
          <Button onClick={() => window.location.href = '/admissions'} size="sm" className="mt-2">
            Visit Admissions Portal
          </Button>
        </div>
      </PageFrame>
    );
  }

  const { applicant, isEnrolled, enrollmentNumber, studentId, accountAccess } = dashboard;

  return (
    <PageFrame
      title={`Applicant Portal — Welcome, ${applicant.firstName}`}
      description="Track the status of your applications, inquiries, and admissions lifecycle"
    >
      <div className="space-y-6">
        
        {/* ENROLLED CELEBRATION BANNER */}
        {isEnrolled && (
          <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl shadow-md space-y-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-white/20 rounded-xl">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider bg-white/25 px-2.5 py-0.5 rounded-full">
                  Admission Finalized & Enrolled
                </span>
                <h3 className="text-xl font-bold mt-1">Official Student Status Conferred!</h3>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-emerald-50 leading-relaxed max-w-2xl">
              Congratulations! Your admission has been accepted and finalized. You are now an active student at EduPulse.
              Independent ERP user credentials have been provisioned below for the student and linked guardian.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <div className="bg-black/20 px-3.5 py-1.5 rounded-lg text-xs font-mono">
                <span className="text-emerald-200 mr-2">Enrollment No:</span>
                <span className="font-bold text-white tracking-wider">{enrollmentNumber || 'Pending'}</span>
              </div>
              {studentId && (
                <div className="bg-black/20 px-3.5 py-1.5 rounded-lg text-xs font-mono">
                  <span className="text-emerald-200 mr-2">Student ID:</span>
                  <span className="font-bold text-white tracking-wider">#{studentId}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* WORKSTREAM E: ENROLLED STUDENT & GUARDIAN ERP CREDENTIALS DELIVERY */}
        {(isEnrolled || accountAccess) && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Official ERP Account Provisioning &amp; Access Details
              </h3>
              <p className="text-xs text-slate-500">
                Admission has been finalized. Below are the separate, independent ERP user accounts provisioned for the student and linked guardian.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* STUDENT ERP ACCOUNT CARD */}
              <Card className="border-emerald-200/80 bg-white shadow-xs rounded-xl overflow-hidden">
                <div className="bg-emerald-50/70 border-b border-emerald-100 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-emerald-700" />
                    <div>
                      <h4 className="text-sm font-bold text-emerald-950">Student ERP Account</h4>
                      <p className="text-[11px] text-emerald-700 font-medium">Independent Student Portal Access</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    {accountAccess?.studentStatus || 'ACTIVE'}
                  </span>
                </div>
                <CardContent className="p-4 space-y-3.5 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 font-bold uppercase block mb-0.5">ERP Login Identifier</span>
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1.5">
                      <span className="font-mono font-bold text-slate-900">
                        {accountAccess?.studentLoginIdentifier || accountAccess?.studentEmail || `stu_${enrollmentNumber?.toLowerCase()}`}
                      </span>
                      <button 
                        onClick={() => copyToClipboard(accountAccess?.studentLoginIdentifier || accountAccess?.studentEmail || '', 'Student Identifier')}
                        className="text-slate-400 hover:text-slate-700"
                        title="Copy Login Identifier"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 font-bold uppercase block mb-0.5">Institutional Email</span>
                    <p className="font-mono text-slate-800">{accountAccess?.studentEmail || applicant.email}</p>
                  </div>

                  {/* Initial Temporary Password / Disclosure */}
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 uppercase">Initial Password:</span>
                      {revealedCredentials?.studentTemporaryPassword ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded border border-emerald-300">
                            {revealedCredentials.studentTemporaryPassword}
                          </span>
                          <button 
                            onClick={() => copyToClipboard(revealedCredentials.studentTemporaryPassword!, 'Student Temporary Password')}
                            className="text-emerald-700 hover:text-emerald-900"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : accountAccess?.studentOneTimeSecretAvailable ? (
                        <Button 
                          size="sm" 
                          onClick={() => handleDiscloseCredentials(accountAccess!.applicationId)}
                          disabled={revealingPassword}
                          className="h-7 text-[11px] bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg"
                        >
                          {revealingPassword ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <KeyRound className="w-3 h-3 mr-1" />}
                          Reveal Temporary Password
                        </Button>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-medium italic">
                          Password Disclosed / Reset Enabled
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      To access courses, timetable, and attendance, open the ERP Sign In page, select the <strong>Student</strong> role tab, and sign in.
                    </p>
                  </div>

                  <div className="pt-1">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        const userParam = accountAccess?.studentLoginIdentifier || enrollmentNumber || '';
                        logout();
                        navigate(`/login?role=STUDENT${userParam ? `&username=${encodeURIComponent(userParam)}` : ''}`);
                      }}
                      className="w-full text-xs font-bold border-emerald-300 text-emerald-800 hover:bg-emerald-50 h-8.5 rounded-lg flex items-center justify-center gap-1.5"
                    >
                      Open ERP Sign In (Student Role) <ArrowUpRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* LINKED GUARDIAN ACCOUNT CARD */}
              <Card className="border-blue-200/80 bg-white shadow-xs rounded-xl overflow-hidden">
                <div className="bg-blue-50/70 border-b border-blue-100 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-700" />
                    <div>
                      <h4 className="text-sm font-bold text-blue-950">Linked Guardian Account</h4>
                      <p className="text-[11px] text-blue-700 font-medium">Independent Parent / Guardian Portal Access</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    {accountAccess?.guardianStatus || 'ACTIVE'}
                  </span>
                </div>
                <CardContent className="p-4 space-y-3.5 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 font-bold uppercase block mb-0.5">Guardian Name &amp; Relationship</span>
                    <p className="font-semibold text-slate-900">
                      {accountAccess?.guardianName || 'Authorized Family Guardian'} 
                      {accountAccess?.guardianRelation && (
                        <span className="ml-2 text-[10px] font-bold uppercase bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {accountAccess.guardianRelation}
                        </span>
                      )}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 font-bold uppercase block mb-0.5">Guardian Login Identifier</span>
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1.5">
                      <span className="font-mono font-bold text-slate-900">
                        {accountAccess?.guardianLoginIdentifier || accountAccess?.guardianEmail || 'parent@institution.edu'}
                      </span>
                      <button 
                        onClick={() => copyToClipboard(accountAccess?.guardianLoginIdentifier || accountAccess?.guardianEmail || '', 'Guardian Identifier')}
                        className="text-slate-400 hover:text-slate-700"
                        title="Copy Login Identifier"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Initial Temporary Password / Disclosure */}
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 uppercase">Initial Password:</span>
                      {revealedCredentials?.guardianTemporaryPassword ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs bg-blue-100 text-blue-900 px-2 py-0.5 rounded border border-blue-300">
                            {revealedCredentials.guardianTemporaryPassword}
                          </span>
                          <button 
                            onClick={() => copyToClipboard(revealedCredentials.guardianTemporaryPassword!, 'Guardian Temporary Password')}
                            className="text-blue-700 hover:text-blue-900"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : accountAccess?.guardianOneTimeSecretAvailable ? (
                        <Button 
                          size="sm" 
                          onClick={() => handleDiscloseCredentials(accountAccess!.applicationId)}
                          disabled={revealingPassword}
                          className="h-7 text-[11px] bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg"
                        >
                          {revealingPassword ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <KeyRound className="w-3 h-3 mr-1" />}
                          Reveal Temporary Password
                        </Button>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-medium italic">
                          Password Disclosed / Reset Enabled
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      To track fee statements, attendance alerts, and academic progress for linked wards, open ERP Sign In and select the <strong>Parent</strong> role tab.
                    </p>
                  </div>

                  <div className="pt-1">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        const userParam = accountAccess?.guardianLoginIdentifier || '';
                        logout();
                        navigate(`/login?role=PARENT${userParam ? `&username=${encodeURIComponent(userParam)}` : ''}`);
                      }}
                      className="w-full text-xs font-bold border-blue-300 text-blue-800 hover:bg-blue-50 h-8.5 rounded-lg flex items-center justify-center gap-1.5"
                    >
                      Open ERP Sign In (Parent Role) <ArrowUpRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* APPLICANT PROFILE SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-slate-200 bg-white">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-medium text-slate-500">Registered Applicant</CardDescription>
              <CardTitle className="text-lg font-bold text-slate-900">{applicant.firstName} {applicant.lastName}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-600 space-y-1">
              <p><span className="text-slate-400">Email:</span> {applicant.email}</p>
              <p><span className="text-slate-400">Phone:</span> {applicant.phone}</p>
              {applicant.address && <p><span className="text-slate-400">Address:</span> {applicant.address}</p>}
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-medium text-slate-500">Formal Applications</CardDescription>
              <CardTitle className="text-2xl font-black text-blue-600">{sortedApplications.length}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-500">
              {sortedApplications.length > 0 
                ? `Latest application: ${sortedApplications[0].applicationNumber} (${sortedApplications[0].status})`
                : 'No applications submitted yet.'}
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-medium text-slate-500">Counselor Inquiries</CardDescription>
              <CardTitle className="text-2xl font-black text-slate-700">{sortedInquiries.length}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-500">
              {sortedInquiries.length > 0
                ? `${sortedInquiries.filter(i => i.status === 'REPLIED').length} answered by counseling office`
                : 'No inquiries logged.'}
            </CardContent>
          </Card>
        </div>

        {/* TABS & ACTIONS */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('applications')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'applications'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5 inline mr-1.5" />
              Formal Applications ({sortedApplications.length})
            </button>
            {/* Counselor Inquiries tab button - hidden from frontend view */}
            <button
              onClick={() => setActiveTab('inquiries')}
              className="hidden"
              aria-hidden="true"
            >
              <HelpCircle className="w-3.5 h-3.5 inline mr-1.5" />
              Counselor Inquiries ({sortedInquiries.length})
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsInquiryOpen(true)}
              className="text-xs border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              <MessageSquare className="w-3.5 h-3.5 mr-1 text-slate-500" />
              Ask a Question
            </Button>
            <Button
              size="sm"
              onClick={() => setIsNewAppOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
            >
              <PlusCircle className="w-3.5 h-3.5 mr-1" />
              Submit Application
            </Button>
          </div>
        </div>

        {/* APPLICATIONS TAB */}
        {activeTab === 'applications' && (
          <div className="space-y-4">
            {sortedApplications.length === 0 ? (
              <div className="p-12 text-center bg-white border border-slate-200 rounded-xl space-y-3">
                <GraduationCap className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">No applications registered yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Ready to enroll? Choose your academic program and submit a formal application for admission review.
                </p>
                <Button size="sm" onClick={() => setIsNewAppOpen(true)} className="bg-blue-600 text-white text-xs">
                  Apply for a Program
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {sortedApplications.map((app) => (
                  <Card key={app.id} className="border-slate-200 bg-white hover:border-slate-300 transition-shadow">
                    <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-sm text-slate-900">{app.applicationNumber}</span>
                          <StatusBadge status={app.status} />
                        </div>
                        <p className="text-sm font-semibold text-slate-800">
                          {app.programName || `Program #${app.programId}`}
                          {app.programCode && <span className="text-xs text-slate-500 font-mono ml-2">({app.programCode})</span>}
                        </p>
                        <p className="text-xs text-slate-500">
                          Academic Session: <span className="font-medium text-slate-700">{app.academicYearName || `#${app.academicYearId}`}</span>
                          {app.submissionDate && <span className="ml-3">Submitted on {app.submissionDate}</span>}
                        </p>
                        {app.remarks && (
                          <p className="text-xs text-slate-600 bg-slate-50 px-3 py-1 rounded border border-slate-100">
                            Notes: {app.remarks}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedAppForUpload(app)}
                          className="text-xs border-slate-300 text-slate-700 hover:bg-slate-100"
                        >
                          <UploadCloud className="w-3.5 h-3.5 mr-1 text-slate-500" />
                          Upload Documents
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* INQUIRIES TAB */}
        {activeTab === 'inquiries' && (
          <div className="space-y-4">
            {sortedInquiries.length === 0 ? (
              <div className="p-12 text-center bg-white border border-slate-200 rounded-xl space-y-3">
                <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">No questions or inquiries logged</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Have questions about fees, eligibility, course credits, or hostel facilities? Contact an admissions counselor.
                </p>
                <Button size="sm" onClick={() => setIsInquiryOpen(true)} className="bg-slate-800 text-white text-xs">
                  Ask Admissions Counselor
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedInquiries.map((inq) => (
                  <Card key={inq.id} className="border-slate-200 bg-white">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono font-bold text-slate-700">
                            {inq.inquiryNumber || `INQ-${inq.id}`}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            inq.status === 'REPLIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {inq.status}
                          </span>
                        </div>
                        {inq.createdAt && (
                          <span className="text-[10px] text-slate-400">
                            {new Date(inq.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {inq.programOfInterest && (
                        <p className="text-xs font-semibold text-blue-700">
                          Program: {inq.programOfInterest}
                        </p>
                      )}

                      <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-100">
                        {inq.notes || 'General admissions inquiry.'}
                      </p>

                      {inq.replyMessage && (
                        <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg space-y-1">
                          <p className="text-[11px] font-bold text-emerald-800 flex items-center">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            Admissions Counselor Response:
                          </p>
                          <p className="text-xs text-emerald-900 leading-relaxed">
                            {inq.replyMessage}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODAL: NEW APPLICATION */}
        {isNewAppOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-lg bg-white border-slate-200 shadow-2xl">
              <CardHeader className="border-b border-slate-100 pb-3">
                <CardTitle className="text-base font-bold text-slate-900">Submit Formal Application</CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Select your intended curriculum and academic cohort
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!selectedProgramId || !selectedAcademicYearId) {
                      toast.error('Please choose both a degree program and academic session.');
                      return;
                    }
                    submitAppMutation.mutate({
                      programId: Number(selectedProgramId),
                      academicYearId: Number(selectedAcademicYearId),
                      remarks: appRemarks || undefined,
                    });
                  }}
                  className="space-y-4 text-xs"
                >
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Degree Program*</label>
                    <select
                      required
                      value={selectedProgramId}
                      onChange={(e) => setSelectedProgramId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800"
                    >
                      <option value="">-- Choose Program --</option>
                      {programs.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Academic Year / Session*</label>
                    <select
                      required
                      value={selectedAcademicYearId}
                      onChange={(e) => setSelectedAcademicYearId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800"
                    >
                      <option value="">-- Choose Academic Session --</option>
                      {academicYears.map((ay) => (
                        <option key={ay.id} value={ay.id}>
                          {formatAcademicYearLabel(ay)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Applicant Remarks / Notes</label>
                    <textarea
                      rows={3}
                      placeholder="Special achievements, scholarship queries, or prior diploma information..."
                      value={appRemarks}
                      onChange={(e) => setAppRemarks(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsNewAppOpen(false)}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={submitAppMutation.isPending}
                      className="bg-blue-600 text-white hover:bg-blue-700 text-xs"
                    >
                      {submitAppMutation.isPending ? 'Submitting...' : 'Confirm Application'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* MODAL: SUBMIT INQUIRY */}
        {isInquiryOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-lg bg-white border-slate-200 shadow-2xl">
              <CardHeader className="border-b border-slate-100 pb-3">
                <CardTitle className="text-base font-bold text-slate-900">Ask Admissions Counselor</CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Send a direct question to our admissions team
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!inquiryNotes.trim()) {
                      toast.error('Please write your question or notes.');
                      return;
                    }
                    submitInquiryMutation.mutate({
                      programOfInterest: inquiryProgram || undefined,
                      notes: inquiryNotes.trim(),
                    });
                  }}
                  className="space-y-4 text-xs"
                >
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Program of Interest (Optional)</label>
                    <Input
                      placeholder="e.g. B.Tech Computer Science, MBA, etc."
                      value={inquiryProgram}
                      onChange={(e) => setInquiryProgram(e.target.value)}
                      className="bg-slate-50 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Question / Details*</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="What would you like to ask our counseling department?"
                      value={inquiryNotes}
                      onChange={(e) => setInquiryNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsInquiryOpen(false)}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={submitInquiryMutation.isPending}
                      className="bg-slate-800 text-white hover:bg-slate-900 text-xs"
                    >
                      {submitInquiryMutation.isPending ? 'Sending...' : 'Send Inquiry'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* MODAL: UPLOAD DOCUMENTS */}
        {selectedAppForUpload && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-md bg-white border-slate-200 shadow-2xl">
              <CardHeader className="border-b border-slate-100 pb-3">
                <CardTitle className="text-base font-bold text-slate-900">
                  Upload Document — {selectedAppForUpload.applicationNumber}
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Submit required certificates or photo for verification
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <form onSubmit={handleUploadDocument} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Document Category*</label>
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800"
                    >
                      <option value="PHOTOGRAPH">Passport Photograph</option>
                      <option value="GOVERNMENT_ID">Government ID / Aadhaar Card</option>
                      <option value="TENTH_MARKSHEET">10th Standard Marksheet</option>
                      <option value="TWELFTH_MARKSHEET">12th Standard Marksheet / Diploma</option>
                      <option value="TRANSFER_CERTIFICATE">Transfer Certificate</option>
                      <option value="OTHER">Other Supporting Document</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Select File (PDF, JPG, PNG)*</label>
                    <input
                      type="file"
                      required
                      accept="application/pdf,image/*"
                      onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                      className="w-full text-[11px] text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                    {docFile && (
                      <p className="text-[11px] text-emerald-600 font-semibold mt-1">✓ {docFile.name}</p>
                    )}
                  </div>

                  <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedAppForUpload(null);
                        setDocFile(null);
                      }}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={uploadingDoc || !docFile}
                      className="bg-blue-600 text-white hover:bg-blue-700 text-xs"
                    >
                      {uploadingDoc ? 'Uploading...' : 'Upload Document'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </PageFrame>
  );
}
