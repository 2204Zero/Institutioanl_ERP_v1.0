import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/button';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Calendar, 
  CheckSquare, 
  CreditCard, 
  FileText, 
  Bell, 
  Shield, 
  ArrowRight, 
  Menu, 
  X, 
  Building2, 
  CheckCircle2, 
  Award, 
  Sparkles, 
  UserCheck, 
  Layers, 
  Compass, 
  Briefcase,
  Database,
  ArrowUpRight
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 1. Header & Navigation */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <img 
                src="/logo.jpg" 
                alt="EduPulse ERP Logo" 
                className="h-10 w-10 rounded-xl object-contain shadow-sm border border-slate-200 bg-white" 
              />
              <div className="flex flex-col">
                <span className="font-bold text-xl tracking-tight text-slate-900 flex items-center gap-1.5">
                  EduPulse <span className="text-xs uppercase px-2 py-0.5 rounded-full bg-slate-900 text-amber-400 font-bold tracking-wide">ERP</span>
                </span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">Institutional Management Platform</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
              <a href="#overview" className="hover:text-amber-600 transition-colors">Product Overview</a>
              <a href="#features" className="hover:text-amber-600 transition-colors">Capabilities</a>
              <a href="#modules" className="hover:text-amber-600 transition-colors">Core Modules</a>
              <a href="#workflows" className="hover:text-amber-600 transition-colors">Lifecycle Workflow</a>
              <a href="#audiences" className="hover:text-amber-600 transition-colors">For Institutions</a>
            </nav>

            {/* Header Actions */}
            <div className="hidden md:flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={() => navigate('/admissions')}
                className="border-slate-300 text-slate-800 hover:bg-slate-100 font-semibold"
              >
                <Compass className="h-4 w-4 mr-2 text-amber-600" />
                Admissions Portal
              </Button>
              {isAuthenticated ? (
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                >
                  <UserCheck className="h-4 w-4 mr-2 text-amber-400" />
                  My Workspace ({user?.role})
                </Button>
              ) : (
                <Button 
                  onClick={() => navigate('/login')}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                >
                  ERP User Sign In
                  <ArrowRight className="h-4 w-4 ml-2 text-amber-400" />
                </Button>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-4">
            <nav className="flex flex-col space-y-3 text-sm font-medium text-slate-700">
              <a 
                href="#overview" 
                onClick={() => setMobileMenuOpen(false)} 
                className="px-2 py-1.5 rounded-lg hover:bg-slate-100"
              >
                Product Overview
              </a>
              <a 
                href="#features" 
                onClick={() => setMobileMenuOpen(false)} 
                className="px-2 py-1.5 rounded-lg hover:bg-slate-100"
              >
                Features & Capabilities
              </a>
              <a 
                href="#modules" 
                onClick={() => setMobileMenuOpen(false)} 
                className="px-2 py-1.5 rounded-lg hover:bg-slate-100"
              >
                ERP Modules
              </a>
              <a 
                href="#workflows" 
                onClick={() => setMobileMenuOpen(false)} 
                className="px-2 py-1.5 rounded-lg hover:bg-slate-100"
              >
                End-to-End Workflow
              </a>
              <a 
                href="#audiences" 
                onClick={() => setMobileMenuOpen(false)} 
                className="px-2 py-1.5 rounded-lg hover:bg-slate-100"
              >
                For Institutions
              </a>
            </nav>
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2.5">
              <Button 
                variant="outline" 
                onClick={() => { setMobileMenuOpen(false); navigate('/admissions'); }}
                className="w-full justify-center border-slate-300 text-slate-800 hover:bg-slate-100 font-semibold"
              >
                <Compass className="h-4 w-4 mr-2 text-amber-600" />
                Admissions Portal & Catalog
              </Button>
              {isAuthenticated ? (
                <Button 
                  onClick={() => { setMobileMenuOpen(false); navigate('/dashboard'); }}
                  className="w-full justify-center bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                >
                  <UserCheck className="h-4 w-4 mr-2 text-amber-400" />
                  My Workspace ({user?.role})
                </Button>
              ) : (
                <Button 
                  onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
                  className="w-full justify-center bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                >
                  ERP User Sign In
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200 py-16 lg:py-24">
        {/* Subtle geometric background accents */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#0f172a_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Unified Institutional ERP
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              One Platform to Run Your Entire Institution.
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              EduPulse ERP unifies institutional administration, degree admissions, daily attendance, academic operations, and finance ledgers into a single, cohesive operating system.
            </p>

            {/* Hero CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Button 
                size="lg" 
                onClick={() => navigate('/admissions')}
                className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-md shadow-amber-600/20 px-6 h-12"
              >
                <Compass className="h-5 w-5 mr-2" />
                Explore Admissions Portal
              </Button>
              <Button 
                size="lg" 
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-md shadow-slate-900/20 px-6 h-12"
              >
                ERP User Sign In
                <ArrowRight className="h-4 w-4 ml-2 text-amber-400" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => {
                  const el = document.getElementById('features');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold h-12 px-6"
              >
                Explore ERP Modules
              </Button>
            </div>
          </div>

          {/* Core System Highlights Grid */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-10 border-t border-slate-100">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">10+</div>
              <div className="text-xs sm:text-sm font-medium text-slate-600 mt-1">Integrated Modules</div>
            </div>
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">6</div>
              <div className="text-xs sm:text-sm font-medium text-slate-600 mt-1">Role-Tailored Portals</div>
            </div>
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">Zero</div>
              <div className="text-xs sm:text-sm font-medium text-slate-600 mt-1">Data Silos</div>
            </div>
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">100%</div>
              <div className="text-xs sm:text-sm font-medium text-slate-600 mt-1">Audit Ledgers & Security</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Product Overview Section */}
      <section id="overview" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">Built for Modern Educational Institutions</h2>
            <p className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Eliminate Fragmented Systems and Manual Paper Trails
            </p>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              Colleges and universities struggle with disconnected software: admissions in one spreadsheet, attendance on paper, fee invoices in accounting books, and student records scattered across departments. EduPulse ERP unifies every operational touchpoint on a resilient, secure foundation.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Database className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Single Source of Truth</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                From applicant inquiry through graduation, every record—enrollment numbers, parent linkages, fee balances, and course registrations—shares a canonical data model.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Enforced Security & Ownership</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Role-based access control (RBAC) with stateless JWT tokens ensures applicants only view their own files, guardians only see linked wards, and faculty manage assigned sections.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Multi-Campus Scalability</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Easily administer institutions, autonomous campuses, academic departments, semester courses, and fee structures from a centralized administrative control center.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Product Capabilities & Modules Section */}
      <section id="features" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">Enterprise Capabilities</h2>
            <p className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Real, Battle-Tested Repository Modules
            </p>
            <p className="text-slate-600 text-base">
              Every capability listed below is actively implemented in the EduPulse ERP codebase with end-to-end backend services, database persistence, and specialized UI workflows.
            </p>
          </div>

          <div id="modules" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. SIS */}
            <div className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-slate-50/50 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Student Information Management</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Canonical student profiles with automated enrollment numbers, contact records, emergency contacts, profile avatars with initials fallback, and verified documents.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200 text-xs font-medium text-blue-700 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                Student 360 & Profiles
              </div>
            </div>

            {/* 2. Admissions */}
            <div className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-slate-50/50 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Compass className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Admissions & Enrollment Pipeline</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Prospective inquiries, formal multi-stage applications, counselor message replies, document verification, and one-click canonical student enrollment.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200 text-xs font-medium text-indigo-700 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
                Inquiries & Applications
              </div>
            </div>

            {/* 3. Academics */}
            <div className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-slate-50/50 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <BookOpen className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Academic Programs & Departments</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Curriculum design, degree programs (B.Tech, M.Tech, MBA), course allocations, department structures, and semester academic calendar management.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200 text-xs font-medium text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Degrees, Semesters & Credits
              </div>
            </div>

            {/* 4. Faculty & Timetable */}
            <div className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-slate-50/50 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Calendar className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Faculty & Timetable Management</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Faculty section allocations, class timetables, teaching workload schedules, and direct roster inspection for professors and lecturers.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200 text-xs font-medium text-amber-700 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-amber-600" />
                Sections & Scheduling
              </div>
            </div>

            {/* 5. Attendance */}
            <div className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-slate-50/50 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                  <CheckSquare className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Attendance Tracking</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Daily roll call, session-by-session attendance logs, overall attendance percentages, and automated compliance threshold alerts.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200 text-xs font-medium text-teal-700 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                Live Attendance Logging
              </div>
            </div>

            {/* 6. Fees & Finance */}
            <div className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-slate-50/50 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                  <CreditCard className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Fees & Financial Operations</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Fee structures by program, component breakdowns (tuition, laboratory, examination), student ledgers, receipt generation, and real-time payment reconciliation.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200 text-xs font-medium text-rose-700 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-rose-600" />
                Fee Ledgers & Invoicing
              </div>
            </div>

            {/* 7. Role-Tailored Portals */}
            <div className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-slate-50/50 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center">
                  <Briefcase className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Role-Tailored User Portals</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Dedicated workspaces tailored specifically for Super Administrators, Department Chairs, Faculty, Students, Parents/Guardians, and Prospective Applicants.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200 text-xs font-medium text-violet-700 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-violet-600" />
                6 Distinct Experience Portals
              </div>
            </div>

            {/* 8. Documents & Compliance */}
            <div className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-slate-50/50 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Secure Document Management</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Document verification pipelines supporting photographs, secondary & senior secondary marksheets, transfer certificates, and government IDs with secure storage.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200 text-xs font-medium text-sky-700 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-sky-600" />
                Digital Verification Pipeline
              </div>
            </div>

            {/* 9. Notifications & Auditing */}
            <div className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-slate-50/50 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Bell className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Notifications & Audit Trail</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  In-app notifications for admission updates, inquiry counselor replies, attendance threshold warnings, and system-wide security audit logging.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200 text-xs font-medium text-amber-700 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-amber-600" />
                Live Notification Center
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. End-to-End Institutional Workflow */}
      <section id="workflows" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">The Student & Institutional Lifecycle</h2>
            <p className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              How EduPulse Connects Every Stage
            </p>
            <p className="text-slate-600 text-base">
              A seamless, auditable progression from initial prospective inquiry to active graduation and alumni records.
            </p>
          </div>

          <div className="relative">
            {/* Step flow */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Step 1 */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">Step 1</span>
                  <Compass className="h-5 w-5 text-blue-600" />
                </div>
                <h4 className="font-bold text-slate-900">Prospective Inquiry</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Prospective applicant signs up, explores degree catalogue, and submits trackable inquiries with real reference IDs.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">Step 2</span>
                  <FileText className="h-5 w-5 text-indigo-600" />
                </div>
                <h4 className="font-bold text-slate-900">Application & Documents</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Applicant uploads academic marksheets, photos, and ID documents under an authenticated identity.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Step 3</span>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
                <h4 className="font-bold text-slate-900">Verification & Admission</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Admissions office reviews candidate credentials, verifies certificate authenticity, and extends admission offer.
                </p>
              </div>

              {/* Step 4 */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800">Step 4</span>
                  <Award className="h-5 w-5 text-teal-600" />
                </div>
                <h4 className="font-bold text-slate-900">Canonical Enrollment</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Single-click enrollment generates official institutional enrollment number, student account, and initial SIS profile.
                </p>
              </div>

              {/* Step 5 */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">Step 5</span>
                  <Building2 className="h-5 w-5 text-amber-600" />
                </div>
                <h4 className="font-bold text-slate-900">Course & Timetable Allocation</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Student is mapped to department section, allocated semester subjects, and populated on faculty class rosters.
                </p>
              </div>

              {/* Step 6 */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800">Step 6</span>
                  <CheckSquare className="h-5 w-5 text-cyan-600" />
                </div>
                <h4 className="font-bold text-slate-900">Daily Attendance Tracking</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Faculty log period attendance; live percentage calculations trigger alerts if falling below mandatory thresholds.
                </p>
              </div>

              {/* Step 7 */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">Step 7</span>
                  <CreditCard className="h-5 w-5 text-rose-600" />
                </div>
                <h4 className="font-bold text-slate-900">Fee Invoicing & Payment</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Automated term fee component billing, payment processing, invoice generation, and student finance reconciliation.
                </p>
              </div>

              {/* Step 8 */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">Step 8</span>
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <h4 className="font-bold text-slate-900">Parent & Student Portals</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Guardians monitor linked wards, review attendance, download fee receipts, and receive official notices securely.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Audience & Benefits Section */}
      <section id="audiences" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">Tailored For Every Stakeholder</h2>
            <p className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Designed for Campus Excellence
            </p>
            <p className="text-slate-600 text-base">
              EduPulse delivers tailored workflows and role-scoped visibility for every person in your institution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Administrators */}
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Administrators & Leadership</h3>
              <ul className="text-sm text-slate-600 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  <span>Comprehensive oversight across multi-campuses and departments</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  <span>Real-time revenue, fee collection, and enrollment tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  <span>Immutable audit trails and granular role-based permissions</span>
                </li>
              </ul>
            </div>

            {/* Admissions Officers */}
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                <Compass className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Admissions Officers</h3>
              <ul className="text-sm text-slate-600 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />
                  <span>Digital inquiry tracking with in-app counselor message replies</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />
                  <span>Document verification pipeline for photos, marksheets, and IDs</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />
                  <span>1-click conversion from verified applicant to enrolled student</span>
                </li>
              </ul>
            </div>

            {/* Faculty */}
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Calendar className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Faculty & Professors</h3>
              <ul className="text-sm text-slate-600 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Assigned section rosters and direct class schedule visibility</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Rapid daily roll call logging with session status records</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Student profile inspection and academic advising access</span>
                </li>
              </ul>
            </div>

            {/* Students */}
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold">
                <GraduationCap className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Enrolled Students</h3>
              <ul className="text-sm text-slate-600 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-teal-600 mt-0.5 shrink-0" />
                  <span>Digital student ID card and profile management</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-teal-600 mt-0.5 shrink-0" />
                  <span>Transparent attendance percentage logs and warning alerts</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-teal-600 mt-0.5 shrink-0" />
                  <span>Fee dues review and instant payment receipt downloads</span>
                </li>
              </ul>
            </div>

            {/* Parents & Guardians */}
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Parents & Guardians</h3>
              <ul className="text-sm text-slate-600 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-600 mt-0.5 shrink-0" />
                  <span>Linked ward oversight without access to unrelated students</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-600 mt-0.5 shrink-0" />
                  <span>Direct visibility of ward's attendance records and absences</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-600 mt-0.5 shrink-0" />
                  <span>Fee statement transparency and invoice management</span>
                </li>
              </ul>
            </div>

            {/* Prospective Applicants */}
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Prospective Applicants</h3>
              <ul className="text-sm text-slate-600 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <span>Browse accredited degree programs and curriculum details</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <span>Submit inquiries and track real-time admission decisions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <span>Upload required academic documents through a dedicated portal</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Call To Action Banner */}
      <section className="py-16 bg-slate-900 text-white border-y border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.04] bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Institutional Production Platform
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Enterprise Grade Operations. Zero Data Silos.
          </h2>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Access the public degree catalogue & admissions portal to submit inquiries, or authenticate into your specialized institutional role workspace.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              onClick={() => navigate('/admissions')}
              className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-lg shadow-amber-600/30 px-8 h-12"
            >
              <Compass className="h-5 w-5 mr-2" />
              Admissions Portal & Catalog
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto border-slate-700 bg-slate-800 text-white hover:bg-slate-700 font-semibold px-8 h-12"
            >
              ERP User Sign In
              <ArrowRight className="h-4 w-4 ml-2 text-amber-400" />
            </Button>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 text-sm border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Col 1 */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-white font-bold text-lg">
                <img 
                  src="/logo.jpg" 
                  alt="EduPulse ERP Logo" 
                  className="h-8 w-8 rounded-lg object-contain border border-slate-700 bg-white" 
                />
                <span>EduPulse ERP</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Centralized institutional enterprise resource planning for modern universities, colleges, and academic institutions.
              </p>
            </div>

            {/* Col 2 */}
            <div className="space-y-2">
              <h4 className="text-white font-semibold text-xs uppercase tracking-wider">Product Navigation</h4>
              <ul className="space-y-1.5 text-xs">
                <li><a href="#overview" className="hover:text-white transition-colors">Product Overview</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features & Capabilities</a></li>
                <li><a href="#modules" className="hover:text-white transition-colors">Core ERP Modules</a></li>
                <li><a href="#workflows" className="hover:text-white transition-colors">Institutional Workflow</a></li>
                <li><a href="#audiences" className="hover:text-white transition-colors">For Institutions</a></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div className="space-y-2">
              <h4 className="text-white font-semibold text-xs uppercase tracking-wider">Portals & Workspaces</h4>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <Link to="/admissions" className="hover:text-white transition-colors flex items-center gap-1">
                    Admissions Portal <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white transition-colors flex items-center gap-1">
                    Staff & Student Sign In <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="hover:text-white transition-colors flex items-center gap-1">
                    Role Dashboard <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4 */}
            <div className="space-y-2">
              <h4 className="text-white font-semibold text-xs uppercase tracking-wider">System Architecture</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Java 21 · Spring Boot 3.3.4 · Stateless JWT Security · React 18 · TypeScript · PostgreSQL / Dev-JSON persistence.
              </p>
              <div className="pt-2 text-xs text-slate-500">
                Environment: Production Ready / Dev Profile
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <div>
              © {new Date().getFullYear()} EduPulse ERP System. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <span>Auditable Ledgers</span>
              <span>·</span>
              <span>Role-Based Access</span>
              <span>·</span>
              <span>Secure Document Storage</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
