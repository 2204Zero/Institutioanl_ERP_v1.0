import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../config/api';
import { useAuthStore } from '../store/useAuthStore';
import { 
  Send, 
  CheckCircle, 
  ArrowRight, 
  Clock, 
  Loader2, 
  FileCheck,
  User,
  LogIn,
  UserPlus,
  ShieldCheck,
  Search,
  ArrowLeft,
  Building2,
  AlertCircle,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';

interface PublicProgram {
  id: number;
  name: string;
  code: string;
  degree: string;
  duration?: number;
}

interface PublicAcademicYear {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export default function PublicAdmissions() {
  const navigate = useNavigate();
  const { user, isAuthenticated, login, logout } = useAuthStore();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDegree, setSelectedDegree] = useState('ALL');

  // Selected Program for Action & Intended Action
  const [selectedProgram, setSelectedProgram] = useState<PublicProgram | null>(null);
  const [intendedAction, setIntendedAction] = useState<'inquiry' | 'apply' | null>(null);

  // Modals state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [confirmationData, setConfirmationData] = useState<{
    type: 'inquiry' | 'application';
    referenceId: string;
    programName: string;
    message: string;
  } | null>(null);

  // Login Form State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  // Register Form State
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDob, setRegDob] = useState('');
  const [regGender, setRegGender] = useState('MALE');
  const [regAddress, setRegAddress] = useState('');
  const [regSubmitting, setRegSubmitting] = useState(false);

  // Inquiry Form State
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySubmitting, setInquirySubmitting] = useState(false);

  // Application Form State
  const [appAcademicYearId, setAppAcademicYearId] = useState<string>('');
  const [appDob, setAppDob] = useState('');
  const [appGender, setAppGender] = useState('MALE');
  const [appAddress, setAppAddress] = useState('');
  const [appRemarks, setAppRemarks] = useState('');
  const [appSubmitting, setAppSubmitting] = useState(false);

  // Documents state
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [tenthMarksheetFile, setTenthMarksheetFile] = useState<File | null>(null);
  const [twelfthMarksheetFile, setTwelfthMarksheetFile] = useState<File | null>(null);
  const [govtIdFile, setGovtIdFile] = useState<File | null>(null);

  // Fetch Public Programs
  const { data: programs = [], isLoading: loadingPrograms } = useQuery<PublicProgram[]>({
    queryKey: ['public-programs'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/api/v1/admissions/public/programs');
        const raw = res.data;
        return Array.isArray(raw) ? raw : (raw?.data && Array.isArray(raw.data) ? raw.data : []);
      } catch (err) {
        console.warn('Failed to fetch public programs:', err);
        return [];
      }
    },
  });

  // Fetch Public Academic Years
  const { data: academicYears = [] } = useQuery<PublicAcademicYear[]>({
    queryKey: ['public-academic-years'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/api/v1/admissions/public/academic-years');
        const raw = res.data;
        const list = Array.isArray(raw) ? raw : (raw?.data && Array.isArray(raw.data) ? raw.data : []);
        if (list.length > 0 && !appAcademicYearId) {
          const active = list.find((ay: any) => ay.isActive);
          setAppAcademicYearId(active ? String(active.id) : String(list[0].id));
        }
        return list;
      } catch (err) {
        console.warn('Failed to fetch public academic years:', err);
        return [];
      }
    },
  });

  // Filtered Programs
  const filteredPrograms = programs.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.degree.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDegree = selectedDegree === 'ALL' || p.degree.toUpperCase() === selectedDegree.toUpperCase();
    return matchesSearch && matchesDegree;
  });

  // Available degree types for filter pills
  const availableDegrees = Array.from(new Set(programs.map(p => p.degree))).filter(Boolean);

  // Handle Action Trigger ("Make an Inquiry" or "Apply")
  const handleInitiateAction = (program: PublicProgram, action: 'inquiry' | 'apply') => {
    setSelectedProgram(program);
    setIntendedAction(action);

    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (action === 'inquiry') {
      setShowInquiryModal(true);
    } else {
      setShowApplicationModal(true);
    }
  };

  // Sign In Handler
  const handleAuthLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername.trim() || !loginPassword.trim()) {
      toast.error('Please enter both email/username and password.');
      return;
    }
    setLoginSubmitting(true);
    try {
      const res = await apiClient.post('/auth/login', {
        username: loginUsername.trim(),
        password: loginPassword,
      });
      const data = res.data;
      login(data.accessToken, data.refreshToken, {
        username: data.username,
        role: data.role,
        permissions: data.permissions || [],
      });
      toast.success(`Welcome back, ${data.username}!`);
      setShowAuthModal(false);

      // Seamless point-of-action resumption
      if (intendedAction === 'inquiry' && selectedProgram) {
        setShowInquiryModal(true);
      } else if (intendedAction === 'apply' && selectedProgram) {
        setShowApplicationModal(true);
      } else if (data.role === 'APPLICANT') {
        navigate('/dashboard');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid username or password.');
    } finally {
      setLoginSubmitting(false);
    }
  };

  // Register Handler
  const handleAuthRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFirstName.trim() || !regLastName.trim() || !regEmail.trim() || !regPhone.trim() || !regPassword.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (regPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    setRegSubmitting(true);
    try {
      await apiClient.post('/api/v1/admissions/public/register', {
        firstName: regFirstName.trim(),
        lastName: regLastName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        password: regPassword,
        dateOfBirth: regDob || undefined,
        gender: regGender,
        address: regAddress || undefined,
      });
      toast.success('Account created successfully! Logging you in...');

      // Auto login with new applicant account
      const loginRes = await apiClient.post('/auth/login', {
        username: regEmail.trim(),
        password: regPassword,
      });
      const data = loginRes.data;
      login(data.accessToken, data.refreshToken, {
        username: data.username,
        role: data.role,
        permissions: data.permissions || [],
      });
      setShowAuthModal(false);

      // Seamless point-of-action resumption
      if (intendedAction === 'inquiry' && selectedProgram) {
        setShowInquiryModal(true);
      } else if (intendedAction === 'apply' && selectedProgram) {
        setShowApplicationModal(true);
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create account. Please check your details.');
    } finally {
      setRegSubmitting(false);
    }
  };

  // Submit Inquiry (Authenticated)
  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgram) return;

    setInquirySubmitting(true);
    try {
      const res = await apiClient.post('/api/v1/admissions/public/inquiries', {
        programOfInterest: selectedProgram.name,
        notes: inquiryMessage.trim() || 'General inquiry regarding admissions requirements and curriculum structure.',
      });

      const data = res.data;
      const refId = data.referenceNumber || (data.id ? `INQ-${data.id}` : 'INQ-ACK');
      
      setShowInquiryModal(false);
      setInquiryMessage('');
      setConfirmationData({
        type: 'inquiry',
        referenceId: refId,
        programName: selectedProgram.name,
        message: 'Your inquiry has been successfully registered with the Admissions Office. An admissions counselor will review your question and respond directly to your applicant dashboard.',
      });
      toast.success('Inquiry submitted successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit inquiry. Please ensure you are signed in.');
    } finally {
      setInquirySubmitting(false);
    }
  };

  // Submit Application (Authenticated)
  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgram) return;
    if (!appAcademicYearId) {
      toast.error('Please select an Academic Year.');
      return;
    }

    setAppSubmitting(true);
    try {
      const res = await apiClient.post('/api/v1/admissions/public/applications', {
        programId: selectedProgram.id,
        academicYearId: Number(appAcademicYearId),
        dateOfBirth: appDob || undefined,
        gender: appGender,
        address: appAddress || undefined,
        remarks: appRemarks || undefined,
      });

      const createdApp = res.data;
      const appId = createdApp.id;

      // Upload documents if selected
      const uploadDoc = async (type: string, file: File) => {
        try {
          const fd = new FormData();
          fd.append('documentType', type);
          fd.append('file', file);
          await apiClient.post(`/api/v1/admissions/public/applications/${appId}/documents`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } catch (uploadErr) {
          console.warn(`Failed to upload ${type}:`, uploadErr);
        }
      };

      if (photoFile) await uploadDoc('PHOTOGRAPH', photoFile);
      if (tenthMarksheetFile) await uploadDoc('TENTH_MARKSHEET', tenthMarksheetFile);
      if (twelfthMarksheetFile) await uploadDoc('TWELFTH_MARKSHEET', twelfthMarksheetFile);
      if (govtIdFile) await uploadDoc('GOVERNMENT_ID', govtIdFile);

      const appNum = createdApp.applicationNumber || `APP-${createdApp.id}`;
      setShowApplicationModal(false);
      setConfirmationData({
        type: 'application',
        referenceId: appNum,
        programName: selectedProgram.name,
        message: 'Your formal application has been submitted for administrative review and document verification. You can track progress, view decisions, and upload additional certificates anytime from your applicant dashboard.',
      });
      toast.success('Application submitted successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit application. Please verify your details.');
    } finally {
      setAppSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      {/* 1. Portal Navigation Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link 
              to="/" 
              className="flex items-center text-slate-500 hover:text-slate-900 transition-colors mr-2 text-xs font-semibold"
              title="Return to EduPulse ERP Product Website"
            >
              <ArrowLeft className="h-4 w-4 mr-1 text-slate-400" />
              <span className="hidden sm:inline">Product Website</span>
            </Link>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <img 
                src="/logo.jpg" 
                alt="EduPulse Logo" 
                className="h-8 w-8 rounded-lg object-cover shadow-xs border border-slate-200" 
              />
              <div>
                <span className="text-base font-bold text-slate-900 tracking-tight">Institutional Admissions</span>
                <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full uppercase tracking-wider">
                  Degree Programs
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 text-xs font-semibold">
            {isAuthenticated ? (
              <>
                <span className="text-slate-600 hidden md:inline mr-1">
                  Signed in as <strong className="text-slate-900">{user?.username}</strong>
                </span>
                <Button 
                  size="sm" 
                  onClick={() => navigate('/dashboard')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  <User className="h-3.5 w-3.5 mr-1.5" />
                  Applicant Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    logout();
                    toast.success('Signed out successfully.');
                  }}
                  className="text-slate-600 hover:bg-slate-100"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedProgram(null);
                    setIntendedAction(null);
                    setAuthMode('login');
                    setShowAuthModal(true);
                  }}
                  className="border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  <LogIn className="h-3.5 w-3.5 mr-1.5" />
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedProgram(null);
                    setIntendedAction(null);
                    setAuthMode('register');
                    setShowAuthModal(true);
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white"
                >
                  <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                  Create Applicant Account
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Institutional Header & Info Banner */}
      <section className="bg-white border-b border-slate-200 py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
                <Building2 className="h-3.5 w-3.5 text-blue-600" />
                Accredited Institutional Degree Catalogue
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Academic Programs & Admissions
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed">
                Explore accredited degree programs offered by the institution. Browse curriculum requirements, make inquiries to admissions counselors, or submit your formal application online.
              </p>
            </div>

            {/* Quick status card for prospective candidates */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-4 shrink-0">
              <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="text-xs space-y-0.5">
                <div className="font-bold text-slate-900">Authenticated Point-of-Action</div>
                <div className="text-slate-500">Inquiries and applications are tied directly to your applicant ID</div>
                {isAuthenticated ? (
                  <div className="text-emerald-700 font-semibold pt-1 flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600" /> Session Active ({user?.username})
                  </div>
                ) : (
                  <div className="text-blue-700 font-semibold pt-1">
                    Sign in when applying to track decisions
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Search & Degree Filters */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search programs by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
              <button
                onClick={() => setSelectedDegree('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                  selectedDegree === 'ALL'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                All Programs ({programs.length})
              </button>
              {availableDegrees.map(deg => (
                <button
                  key={deg}
                  onClick={() => setSelectedDegree(deg)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                    selectedDegree === deg
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {deg}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Program Catalogue Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        {loadingPrograms ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            <p className="text-sm text-slate-500 font-medium">Loading institutional degree programs...</p>
          </div>
        ) : filteredPrograms.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200 space-y-3">
            <BookOpen className="h-10 w-10 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">No programs match your search</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search terms or clearing the degree filter to view all available academic programs.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => { setSearchTerm(''); setSelectedDegree('ALL'); }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.map((program) => (
              <Card key={program.id} className="border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 uppercase tracking-wide">
                      {program.degree || 'Degree Program'}
                    </span>
                    <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {program.code}
                    </span>
                  </div>
                  <CardTitle className="text-lg font-bold text-slate-900 leading-snug line-clamp-2">
                    {program.name}
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>Duration: {program.duration ? `${program.duration} Years (${program.duration * 2} Semesters)` : 'Full-Time Academic Program'}</span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0 space-y-4">
                  <div className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    Comprehensive accredited curriculum covering departmental core disciplines, laboratory workshops, and semester electives.
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleInitiateAction(program, 'inquiry')}
                      className="w-full text-xs border-slate-300 text-slate-700 hover:bg-slate-100"
                    >
                      <HelpCircle className="h-3.5 w-3.5 mr-1 text-slate-500" />
                      Inquiry
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleInitiateAction(program, 'apply')}
                      className="w-full text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                    >
                      <Send className="h-3.5 w-3.5 mr-1" />
                      Apply Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* 4. Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">EduPulse Admissions Portal</span>
            <span>·</span>
            <span>Accredited Academic Programs</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:text-blue-600 transition-colors">
              Product Overview
            </Link>
            <Link to="/login" className="hover:text-blue-600 transition-colors">
              Staff Sign In
            </Link>
            {isAuthenticated && (
              <Link to="/dashboard" className="text-blue-600 font-semibold hover:underline">
                Applicant Dashboard
              </Link>
            )}
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* MODAL 1: Authentication Gate Dialog                                        */}
      {/* ========================================================================= */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden space-y-0">
            {/* Context Header */}
            <div className="bg-blue-600 p-5 text-white space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-wider text-blue-200 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" />
                  Applicant Account Required
                </div>
                <button 
                  onClick={() => setShowAuthModal(false)}
                  className="text-white/80 hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>
              <h3 className="text-lg font-bold">
                {authMode === 'login' ? 'Sign In to Proceed' : 'Create Applicant Account'}
              </h3>
              {selectedProgram && (
                <p className="text-xs text-blue-100 bg-blue-700/60 p-2 rounded-lg">
                  <strong>Selected Action:</strong> {intendedAction === 'apply' ? 'Apply for ' : 'Inquiry regarding '}{selectedProgram.name} ({selectedProgram.degree})
                </p>
              )}
            </div>

            {/* Explanation Banner */}
            <div className="p-4 bg-amber-50 border-b border-amber-200/80 text-xs text-amber-800 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <span>
                To ensure your inquiries, replies, and formal applications are securely tracked and verified, an applicant account is required before submitting.
              </span>
            </div>

            {/* Tabs */}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`py-1.5 rounded-md transition-all ${
                    authMode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className={`py-1.5 rounded-md transition-all ${
                    authMode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Login Form */}
              {authMode === 'login' ? (
                <form onSubmit={handleAuthLogin} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Email or Username</label>
                    <Input
                      type="text"
                      placeholder="e.g. applicant@example.com"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Password</label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={loginSubmitting} 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  >
                    {loginSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        <LogIn className="h-4 w-4 mr-2" />
                        Sign In & Continue
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                /* Register Form */
                <form onSubmit={handleAuthRegister} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">First Name *</label>
                      <Input
                        type="text"
                        placeholder="First"
                        value={regFirstName}
                        onChange={(e) => setRegFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Last Name *</label>
                      <Input
                        type="text"
                        placeholder="Last"
                        value={regLastName}
                        onChange={(e) => setRegLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Email Address *</label>
                    <Input
                      type="email"
                      placeholder="applicant@example.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Mobile Phone *</label>
                    <Input
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Date of Birth</label>
                      <Input
                        type="date"
                        value={regDob}
                        onChange={(e) => setRegDob(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Gender</label>
                      <select
                        value={regGender}
                        onChange={(e) => setRegGender(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Address</label>
                    <Input
                      type="text"
                      placeholder="City, State"
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Password (min 6 characters) *</label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={regSubmitting} 
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold mt-2"
                  >
                    {regSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Register & Continue
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: Inquiry Submission Dialog (Authenticated)                        */}
      {/* ========================================================================= */}
      {showInquiryModal && selectedProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden space-y-0">
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Admissions Inquiry</span>
                <h3 className="text-lg font-bold mt-0.5">{selectedProgram.name}</h3>
              </div>
              <button 
                onClick={() => setShowInquiryModal(false)}
                className="text-white/70 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitInquiry} className="p-5 space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
                Submitting inquiry as <strong>{user?.username}</strong> ({user?.role}). Our counselors will respond to your registered email and applicant dashboard.
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Questions or Topics of Interest</label>
                <textarea
                  rows={4}
                  placeholder="e.g. Inquiring about eligibility requirements, specialization options, fee schedule, and scholarship opportunities..."
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowInquiryModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  size="sm"
                  disabled={inquirySubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  {inquirySubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Inquiry
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: Formal Application Dialog (Authenticated)                        */}
      {/* ========================================================================= */}
      {showApplicationModal && selectedProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="bg-blue-700 p-5 text-white flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-200">Formal Admission Application</span>
                <h3 className="text-xl font-bold mt-0.5">{selectedProgram.name}</h3>
                <span className="text-xs text-blue-200">Degree: {selectedProgram.degree} · Code: {selectedProgram.code}</span>
              </div>
              <button 
                onClick={() => setShowApplicationModal(false)}
                className="text-white/70 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitApplication} className="p-6 space-y-5">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600 shrink-0" />
                <span>Applying under authenticated applicant profile <strong>{user?.username}</strong>.</span>
              </div>

              {/* Academic Year Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Target Academic Year *</label>
                <select
                  value={appAcademicYearId}
                  onChange={(e) => setAppAcademicYearId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Academic Year</option>
                  {academicYears.map((ay) => (
                    <option key={ay.id} value={ay.id}>
                      {ay.name} {ay.isActive ? '(Current Active Intake)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Date of Birth</label>
                  <Input
                    type="date"
                    value={appDob}
                    onChange={(e) => setAppDob(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Gender</label>
                  <select
                    value={appGender}
                    onChange={(e) => setAppGender(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Permanent / Mailing Address</label>
                <Input
                  type="text"
                  placeholder="Street address, City, State, Postal code"
                  value={appAddress}
                  onChange={(e) => setAppAddress(e.target.value)}
                />
              </div>

              {/* Document Attachments */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileCheck className="h-4 w-4 text-blue-600" />
                  Academic & Identity Documents (Optional now, can also upload from dashboard)
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 border border-slate-200 rounded-lg space-y-1">
                    <span className="font-semibold text-slate-700 block">Recent Photograph</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                      className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700"
                    />
                  </div>
                  <div className="p-3 border border-slate-200 rounded-lg space-y-1">
                    <span className="font-semibold text-slate-700 block">10th Marksheet</span>
                    <input 
                      type="file" 
                      accept=".pdf,image/*" 
                      onChange={(e) => setTenthMarksheetFile(e.target.files?.[0] || null)}
                      className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700"
                    />
                  </div>
                  <div className="p-3 border border-slate-200 rounded-lg space-y-1">
                    <span className="font-semibold text-slate-700 block">12th / Diploma Marksheet</span>
                    <input 
                      type="file" 
                      accept=".pdf,image/*" 
                      onChange={(e) => setTwelfthMarksheetFile(e.target.files?.[0] || null)}
                      className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700"
                    />
                  </div>
                  <div className="p-3 border border-slate-200 rounded-lg space-y-1">
                    <span className="font-semibold text-slate-700 block">Government ID Proof</span>
                    <input 
                      type="file" 
                      accept=".pdf,image/*" 
                      onChange={(e) => setGovtIdFile(e.target.files?.[0] || null)}
                      className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Remarks or Special Category / Quota Details</label>
                <Input
                  type="text"
                  placeholder="e.g. Merit quota, sports quota, or previous academic honors"
                  value={appRemarks}
                  onChange={(e) => setAppRemarks(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowApplicationModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  size="sm"
                  disabled={appSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  {appSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Registering Application...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Formal Application
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: Genuine Confirmation Dialog                                      */}
      {/* ========================================================================= */}
      {confirmationData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 text-center space-y-4">
            <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                {confirmationData.type === 'inquiry' ? 'Inquiry Registered' : 'Application Submitted'}
              </span>
              <h3 className="text-xl font-extrabold text-slate-900">
                {confirmationData.referenceId}
              </h3>
              <p className="text-xs font-semibold text-slate-600">
                Program: {confirmationData.programName}
              </p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
              {confirmationData.message}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={() => navigate('/dashboard')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
              >
                Go to Applicant Dashboard
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
              <Button 
                variant="outline"
                onClick={() => setConfirmationData(null)}
                className="w-full text-xs border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Browse More Programs
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
