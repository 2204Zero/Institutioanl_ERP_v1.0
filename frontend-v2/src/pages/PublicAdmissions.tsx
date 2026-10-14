import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../config/api';
import { formatAcademicYearLabel, formatProgramLabel } from '../lib/academicUtils';
import { 
  GraduationCap, 
  Send, 
  CheckCircle, 
  ArrowRight, 
  Clock, 
  Loader2, 
  FileCheck
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
  const [activeTab, setActiveTab] = useState<'programs' | 'inquiry' | 'apply'>('programs');

  // Fetch public programs
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

  // Fetch public academic years
  const { data: academicYears = [] } = useQuery<PublicAcademicYear[]>({
    queryKey: ['public-academic-years'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/api/v1/admissions/public/academic-years');
        const raw = res.data;
        return Array.isArray(raw) ? raw : (raw?.data && Array.isArray(raw.data) ? raw.data : []);
      } catch (err) {
        console.warn('Failed to fetch public academic years:', err);
        return [];
      }
    },
  });

  // Inquiry Form State
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryProgram, setInquiryProgram] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySubmitting, setInquirySubmitting] = useState(false);
  const [inquirySuccessRef, setInquirySuccessRef] = useState<string | null>(null);

  // Formal Application Form State
  const [appFirstName, setAppFirstName] = useState('');
  const [appLastName, setAppLastName] = useState('');
  const [appEmail, setAppEmail] = useState('');
  const [appPhone, setAppPhone] = useState('');
  const [appDob, setAppDob] = useState('');
  const [appGender, setAppGender] = useState('MALE');
  const [appAddress, setAppAddress] = useState('');
  const [appProgramId, setAppProgramId] = useState<string>('');
  const [appAcademicYearId, setAppAcademicYearId] = useState<string>('');
  const [appSubmitting, setAppSubmitting] = useState(false);
  const [appSuccessResult, setAppSuccessResult] = useState<{ id: number; applicationNumber?: string } | null>(null);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryEmail.trim() || !inquiryPhone.trim()) {
      toast.error('Please provide name, email, and contact phone number.');
      return;
    }
    setInquirySubmitting(true);
    try {
      const res = await apiClient.post('/api/v1/admissions/public/inquiries', {
        prospectName: inquiryName.trim(),
        email: inquiryEmail.trim(),
        phone: inquiryPhone.trim(),
        programOfInterest: inquiryProgram || undefined,
        notes: inquiryMessage || undefined,
      });
      const applicant = res.data;
      setInquirySuccessRef(`INQ-${applicant.id || Math.floor(1000 + Math.random() * 9000)}`);
      toast.success('Inquiry submitted successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setInquirySubmitting(false);
    }
  };

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appFirstName.trim() || !appLastName.trim() || !appEmail.trim() || !appPhone.trim()) {
      toast.error('Please complete all required applicant details.');
      return;
    }
    if (!appProgramId || !appAcademicYearId) {
      toast.error('Please select both a Degree Program and Academic Year.');
      return;
    }

    setAppSubmitting(true);
    try {
      const res = await apiClient.post('/api/v1/admissions/public/applications', {
        firstName: appFirstName.trim(),
        lastName: appLastName.trim(),
        email: appEmail.trim(),
        phone: appPhone.trim(),
        dateOfBirth: appDob || undefined,
        gender: appGender,
        address: appAddress || undefined,
        programId: Number(appProgramId),
        academicYearId: Number(appAcademicYearId),
      });
      setAppSuccessResult({
        id: res.data.id,
        applicationNumber: res.data.applicationNumber || `APP-${res.data.id}`,
      });
      toast.success('Application registered and submitted for review!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit application. Please verify details.');
    } finally {
      setAppSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Header / Brand Nav */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/logo.jpg?v=3" alt="EduPulse Logo" className="w-9 h-9 rounded-lg object-cover shadow-xs" />
            <div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">EduPulse ERP</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                Admissions Portal
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-xs font-semibold">
            <Link 
              to="/login"
              className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Sign In to ERP
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-slate-100/60 border-b border-slate-200 py-12 px-4 sm:px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-100/80 text-blue-800 text-xs font-bold uppercase tracking-wide">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Admissions & Enrollments</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Institutional Degree Programs & Admissions
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Explore accredited undergraduate and graduate programs, submit general inquiries to admissions counselors, or submit your formal online application.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex justify-center mt-8">
          <div className="inline-flex bg-slate-200/80 p-1 rounded-xl shadow-inner text-xs font-semibold space-x-1">
            <button
              onClick={() => setActiveTab('programs')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'programs'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1. Degree Programs ({programs.length})
            </button>
            <button
              onClick={() => setActiveTab('inquiry')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'inquiry'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2. Submit Inquiry
            </button>
            <button
              onClick={() => setActiveTab('apply')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'apply'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              3. Formal Application
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Tab 1: Programs Exploration */}
        {activeTab === 'programs' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Academic Offerings</h2>
                <p className="text-xs text-slate-500">Live institutional curricula available for enrollment</p>
              </div>
              <Button size="sm" onClick={() => setActiveTab('apply')} className="bg-slate-900 text-white hover:bg-slate-800 text-xs">
                Apply for Admission <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>

            {loadingPrograms ? (
              <div className="p-12 text-center flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
            ) : programs.length === 0 ? (
              <div className="p-12 text-center bg-white border border-slate-200 rounded-xl text-slate-500 text-sm">
                No active academic programs currently configured.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {programs.map((prog) => (
                  <Card key={prog.id} className="border-slate-200 bg-white hover:border-slate-300 transition-shadow hover:shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {prog.code}
                        </span>
                        <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          {prog.degree || 'Degree Program'}
                        </span>
                      </div>
                      <CardTitle className="text-base font-bold text-slate-900">{prog.name}</CardTitle>
                      <CardDescription className="text-xs text-slate-500">
                        {prog.duration ? `${prog.duration} Academic Years • Full Time` : 'Comprehensive Multi-Semester Curriculum'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 text-xs text-slate-600 space-y-3">
                      <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-[11px]">
                        <span className="text-slate-400 flex items-center"><Clock className="w-3 h-3 mr-1" /> Modular Credit System</span>
                        <button
                          onClick={() => {
                            setAppProgramId(String(prog.id));
                            setActiveTab('apply');
                          }}
                          className="font-bold text-blue-600 hover:text-blue-800 inline-flex items-center"
                        >
                          Select &amp; Apply &rarr;
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: General Inquiry Form */}
        {activeTab === 'inquiry' && (
          <div className="max-w-xl mx-auto">
            {inquirySuccessRef ? (
              <div className="bg-white border border-emerald-200 rounded-2xl p-8 text-center space-y-4 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Inquiry Received</h3>
                <p className="text-xs text-slate-600">
                  Thank you for your interest! Your inquiry has been registered with reference ID:
                </p>
                <div className="font-mono font-bold text-lg text-emerald-700 bg-emerald-50 py-2 px-4 rounded-lg inline-block">
                  {inquirySuccessRef}
                </div>
                <p className="text-[11px] text-slate-500">
                  An institutional admissions officer will contact you within 1-2 business days.
                </p>
                <div className="pt-2 flex justify-center space-x-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setInquirySuccessRef(null);
                      setInquiryName('');
                      setInquiryEmail('');
                      setInquiryPhone('');
                      setInquiryMessage('');
                    }}
                  >
                    Submit Another Inquiry
                  </Button>
                  <Button size="sm" onClick={() => setActiveTab('apply')} className="bg-blue-600 text-white hover:bg-blue-700">
                    Proceed to Application
                  </Button>
                </div>
              </div>
            ) : (
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-900">Request Information / Admissions Inquiry</CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Have questions about courses, deadlines, or fees? Leave your details below.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleInquirySubmit} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Full Name*</label>
                      <Input
                        required
                        placeholder="e.g. Priya Sharma"
                        value={inquiryName}
                        onChange={(e) => setInquiryName(e.target.value)}
                        className="bg-slate-50 text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Email Address*</label>
                        <Input
                          required
                          type="email"
                          placeholder="priya@example.com"
                          value={inquiryEmail}
                          onChange={(e) => setInquiryEmail(e.target.value)}
                          className="bg-slate-50 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Phone Number*</label>
                        <Input
                          required
                          placeholder="+91 98765 43210"
                          value={inquiryPhone}
                          onChange={(e) => setInquiryPhone(e.target.value)}
                          className="bg-slate-50 text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Program of Interest</label>
                      <select
                        value={inquiryProgram}
                        onChange={(e) => setInquiryProgram(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800"
                      >
                        <option value="">Select a Program (Optional)</option>
                        {programs.map((p) => (
                          <option key={p.id} value={p.name}>
                            {formatProgramLabel(p)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Questions / Notes</label>
                      <textarea
                        rows={3}
                        placeholder="Tell us about your background or ask any questions..."
                        value={inquiryMessage}
                        onChange={(e) => setInquiryMessage(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800"
                      />
                    </div>
                    <Button type="submit" disabled={inquirySubmitting} className="w-full bg-slate-900 text-white hover:bg-slate-800">
                      {inquirySubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Send className="w-4 h-4 mr-1" />}
                      Send Inquiry
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Tab 3: Formal Application Form */}
        {activeTab === 'apply' && (
          <div className="max-w-2xl mx-auto">
            {appSuccessResult ? (
              <div className="bg-white border border-emerald-200 rounded-2xl p-8 text-center space-y-4 shadow-sm">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <FileCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Application Submitted!</h3>
                <p className="text-xs text-slate-600">
                  Your formal admissions application has been submitted to the institutional review workflow.
                </p>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Official Application Reference</p>
                  <p className="text-xl font-mono font-bold text-slate-900">{appSuccessResult.applicationNumber}</p>
                  <p className="text-[11px] text-slate-500">Internal Record #{appSuccessResult.id}</p>
                </div>
                <p className="text-xs text-slate-500">
                  Please retain this application number for correspondence and tracking your admissions status.
                </p>
                <div className="pt-2">
                  <Button asChild variant="outline" size="sm">
                    <Link to="/login">Return to ERP Login</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-900">Formal Student Application Form</CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Submit applicant credentials to initiate verification and departmental evaluation.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleApplicationSubmit} className="space-y-4 text-xs">
                    
                    {/* Program & AY */}
                    <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3.5 space-y-3">
                      <p className="font-bold text-blue-900 text-xs">Academic Selection</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Degree Program*</label>
                          <select
                            required
                            value={appProgramId}
                            onChange={(e) => setAppProgramId(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-xs text-slate-800"
                          >
                            <option value="">Select Degree Program</option>
                            {programs.map((p) => (
                              <option key={p.id} value={p.id}>
                                {formatProgramLabel(p)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Academic Year*</label>
                          <select
                            required
                            value={appAcademicYearId}
                            onChange={(e) => setAppAcademicYearId(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-xs text-slate-800"
                          >
                            <option value="">Select Academic Year</option>
                            {academicYears.map((ay) => (
                              <option key={ay.id} value={ay.id}>
                                {formatAcademicYearLabel(ay)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Applicant Profile */}
                    <div className="space-y-3">
                      <p className="font-bold text-slate-800 text-xs">Personal Information</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">First Name*</label>
                          <Input
                            required
                            placeholder="Aarav"
                            value={appFirstName}
                            onChange={(e) => setAppFirstName(e.target.value)}
                            className="bg-slate-50 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Last Name*</label>
                          <Input
                            required
                            placeholder="Sharma"
                            value={appLastName}
                            onChange={(e) => setAppLastName(e.target.value)}
                            className="bg-slate-50 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Email Address*</label>
                          <Input
                            required
                            type="email"
                            placeholder="aarav.sharma@example.com"
                            value={appEmail}
                            onChange={(e) => setAppEmail(e.target.value)}
                            className="bg-slate-50 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Mobile Phone*</label>
                          <Input
                            required
                            placeholder="+91 98765 43210"
                            value={appPhone}
                            onChange={(e) => setAppPhone(e.target.value)}
                            className="bg-slate-50 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
                          <Input
                            type="date"
                            value={appDob}
                            onChange={(e) => setAppDob(e.target.value)}
                            className="bg-slate-50 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                          <select
                            value={appGender}
                            onChange={(e) => setAppGender(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800"
                          >
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Residential Address</label>
                        <Input
                          placeholder="Street, City, State, Pincode"
                          value={appAddress}
                          onChange={(e) => setAppAddress(e.target.value)}
                          className="bg-slate-50 text-xs"
                        />
                      </div>
                    </div>

                    <Button type="submit" disabled={appSubmitting} className="w-full bg-blue-600 text-white hover:bg-blue-700 mt-2">
                      {appSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <FileCheck className="w-4 h-4 mr-1" />}
                      Submit Application for Review
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
