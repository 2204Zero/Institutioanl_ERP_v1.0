import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  BarChart3,
  BrainCircuit,
  Search,
  FileText,
  Users,
  DollarSign,
  GraduationCap,
  BookOpen,
  Home,
  Bus,
  Award,
  AlertTriangle,
  Download,
  Calendar,
  CheckCircle,
  Sparkles,
  ShieldAlert,
  Cpu,
  Filter,
} from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { EnterpriseChartEngine } from '../components/analytics/EnterpriseChartEngine';
import { AISearchAssistant } from '../components/analytics/AISearchAssistant';
import {
  getGlobalAnalyticsKPIs,
  getStudentDomainAnalytics,
  getFacultyDomainAnalytics,
  getFinanceDomainAnalytics,
  getLibraryDomainAnalytics,
  getHostelDomainAnalytics,
  getTransportDomainAnalytics,
  getExamDomainAnalytics,
  getHRDomainAnalytics,
  getAIPredictions,
  getScheduledReports,
  logAnalyticsAction,
} from '../services/analyticsService';
import {
  GlobalAnalyticsKPIs,
  StudentDomainAnalytics,
  FacultyDomainAnalytics,
  FinanceDomainAnalytics,
  LibraryDomainAnalytics,
  HostelDomainAnalytics,
  TransportDomainAnalytics,
  ExamDomainAnalytics,
  HRDomainAnalytics,
  AIPredictionRecord,
  AIModelMetrics,
  ScheduledReport,
  UserRoleType,
} from '../types/analyticsTypes';

export const AnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'domain' | 'aiHub' | 'nlSearch' | 'reports'>('overview');
  const [selectedRole, setSelectedRole] = useState<UserRoleType>('Principal');
  const [selectedDomainTab, setSelectedDomainTab] = useState<'student' | 'finance' | 'faculty' | 'library' | 'hostel' | 'transport' | 'exam' | 'hr'>('student');

  // Loaded Data States
  const [kpis, setKpis] = useState<GlobalAnalyticsKPIs | null>(null);
  const [studentData, setStudentData] = useState<StudentDomainAnalytics | null>(null);
  const [facultyData, setFacultyData] = useState<FacultyDomainAnalytics | null>(null);
  const [financeData, setFinanceData] = useState<FinanceDomainAnalytics | null>(null);
  const [libraryData, setLibraryData] = useState<LibraryDomainAnalytics | null>(null);
  const [hostelData, setHostelData] = useState<HostelDomainAnalytics | null>(null);
  const [transportData, setTransportData] = useState<TransportDomainAnalytics | null>(null);
  const [examData, setExamData] = useState<ExamDomainAnalytics | null>(null);
  const [hrData, setHrData] = useState<HRDomainAnalytics | null>(null);
  const [aiPredictions, setAiPredictions] = useState<AIPredictionRecord[]>([]);
  const [aiMetrics, setAiMetrics] = useState<AIModelMetrics[]>([]);
  const [reports, setReports] = useState<ScheduledReport[]>([]);

  useEffect(() => {
    setKpis(getGlobalAnalyticsKPIs());
    setStudentData(getStudentDomainAnalytics());
    setFacultyData(getFacultyDomainAnalytics());
    setFinanceData(getFinanceDomainAnalytics());
    setLibraryData(getLibraryDomainAnalytics());
    setHostelData(getHostelDomainAnalytics());
    setTransportData(getTransportDomainAnalytics());
    setExamData(getExamDomainAnalytics());
    setHrData(getHRDomainAnalytics());

    const ai = getAIPredictions();
    setAiPredictions(ai.predictions);
    setAiMetrics(ai.metrics);
    setReports(getScheduledReports());

    logAnalyticsAction('System Admin', selectedRole, 'Loaded Analytics Platform Workspace', 'BI Core');
  }, [selectedRole]);

  const handleExport = (format: 'PDF' | 'EXCEL' | 'CSV') => {
    logAnalyticsAction('User', selectedRole, `Triggered Export in ${format} format`, 'Analytics Report Builder');
    alert(`Generating ${format} report bundle. Download will start automatically.`);
  };

  const roles: UserRoleType[] = [
    'Principal',
    'Department Head',
    'Finance Officer',
    'Teacher',
    'Student',
    'HR Manager',
    'Library Manager',
    'Transport Manager',
    'Administrator',
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-500/20">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Enterprise Analytics & AI Platform
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-500/10 text-brand-400 border border-brand-500/30">
                  Phase 11
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Unified institutional Business Intelligence, predictive machine learning models, & natural language analytics.
              </p>
            </div>

            {/* Role Switcher & Export */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400 font-medium">Role View:</span>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRoleType)}
                  className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
                >
                  {roles.map((r) => (
                    <option key={r} value={r} className="bg-slate-900 text-white">
                      {r} View
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleExport('PDF')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> PDF
                </button>
                <button
                  onClick={() => handleExport('EXCEL')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Excel
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" /> Executive BI Dashboard
            </button>
            <button
              onClick={() => setActiveTab('domain')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'domain'
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Users className="w-4 h-4" /> Domain Intelligence
            </button>
            <button
              onClick={() => setActiveTab('aiHub')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'aiHub'
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <BrainCircuit className="w-4 h-4" /> AI & ML Predictive Hub
            </button>
            <button
              onClick={() => setActiveTab('nlSearch')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'nlSearch'
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4" /> Natural Language Search
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'reports'
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" /> Report Engine & Schedules
            </button>
          </div>

          {/* TAB 1: EXECUTIVE BI DASHBOARD */}
          {activeTab === 'overview' && kpis && (
            <div className="space-y-6">
              {/* Executive KPI Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 shadow-md">
                  <span className="text-xs font-medium text-slate-400">Total Students</span>
                  <p className="text-2xl font-bold text-white mt-1">{kpis.totalStudents.toLocaleString()}</p>
                  <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1 mt-1">
                    ↑ +4.2% YoY Growth
                  </span>
                </div>
                <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 shadow-md">
                  <span className="text-xs font-medium text-slate-400">Faculty Members</span>
                  <p className="text-2xl font-bold text-white mt-1">{kpis.totalFaculty}</p>
                  <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1 mt-1">
                    1:14 Student Ratio
                  </span>
                </div>
                <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 shadow-md">
                  <span className="text-xs font-medium text-slate-400">Annual Revenue</span>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">
                    ₹{(kpis.annualRevenue / 10000000).toFixed(1)} Cr
                  </p>
                  <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1 mt-1">
                    ↑ 98.4% Collection
                  </span>
                </div>
                <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 shadow-md">
                  <span className="text-xs font-medium text-slate-400">Attendance Rate</span>
                  <p className="text-2xl font-bold text-white mt-1">{kpis.overallAttendanceRate}%</p>
                  <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1 mt-1">
                    Optimal Range
                  </span>
                </div>
                <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 shadow-md">
                  <span className="text-xs font-medium text-slate-400">Placement %</span>
                  <p className="text-2xl font-bold text-brand-400 mt-1">{kpis.placementPercentage}%</p>
                  <span className="text-[10px] font-semibold text-brand-400 flex items-center gap-1 mt-1">
                    Top Tier Target
                  </span>
                </div>
                <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 shadow-md">
                  <span className="text-xs font-medium text-slate-400">Average CGPA</span>
                  <p className="text-2xl font-bold text-white mt-1">{kpis.averageCGPA}</p>
                  <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1 mt-1">
                    First Class Distinction
                  </span>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EnterpriseChartEngine
                  type="bar"
                  title="Department Strength Breakdown"
                  subtitle="Total enrolled candidates across major engineering disciplines"
                  data={studentData?.strengthByDepartment || []}
                  height={260}
                />
                <EnterpriseChartEngine
                  type="donut"
                  title="Fee Collection Channel Distribution"
                  subtitle="Percentage breakdown of tuition payment modes"
                  data={financeData?.feeCollectionModeBreakdown || []}
                  height={260}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <EnterpriseChartEngine
                    type="area"
                    title="5-Year Student Admissions Growth"
                    subtitle="Yearly intake statistics across undergraduate & postgraduate programs"
                    data={studentData?.admissionsTrend || []}
                    height={250}
                  />
                </div>
                <EnterpriseChartEngine
                  type="gauge"
                  title="Hostel Block Occupancy Index"
                  subtitle="Real-time room capacity utilization rate"
                  data={[{ label: 'Overall Occupancy', value: kpis.hostelOccupancyRate }]}
                  height={250}
                />
              </div>
            </div>
          )}

          {/* TAB 2: DOMAIN INTELLIGENCE */}
          {activeTab === 'domain' && (
            <div className="space-y-6">
              {/* Domain Switcher Pills */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
                <button
                  onClick={() => setSelectedDomainTab('student')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                    selectedDomainTab === 'student' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" /> Student SIS
                </button>
                <button
                  onClick={() => setSelectedDomainTab('finance')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                    selectedDomainTab === 'finance' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" /> Finance
                </button>
                <button
                  onClick={() => setSelectedDomainTab('faculty')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                    selectedDomainTab === 'faculty' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" /> Faculty & Research
                </button>
                <button
                  onClick={() => setSelectedDomainTab('library')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                    selectedDomainTab === 'library' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" /> Library
                </button>
                <button
                  onClick={() => setSelectedDomainTab('hostel')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                    selectedDomainTab === 'hostel' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Home className="w-3.5 h-3.5" /> Hostel
                </button>
                <button
                  onClick={() => setSelectedDomainTab('transport')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                    selectedDomainTab === 'transport' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Bus className="w-3.5 h-3.5" /> Transport
                </button>
                <button
                  onClick={() => setSelectedDomainTab('exam')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                    selectedDomainTab === 'exam' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" /> Examination
                </button>
                <button
                  onClick={() => setSelectedDomainTab('hr')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                    selectedDomainTab === 'hr' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" /> HRMS
                </button>
              </div>

              {/* Render Domain Content */}
              {selectedDomainTab === 'student' && studentData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <EnterpriseChartEngine
                    type="bar"
                    title="CGPA Distribution Spectrum"
                    subtitle="Percentage of students within specific GPA bands"
                    data={studentData.cgpaDistribution}
                    height={260}
                  />
                  <EnterpriseChartEngine
                    type="donut"
                    title="Attendance Band Categorization"
                    subtitle="Distribution of student attendance percentages"
                    data={studentData.attendanceDistribution}
                    height={260}
                  />
                </div>
              )}

              {selectedDomainTab === 'finance' && financeData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <EnterpriseChartEngine
                    type="bar"
                    title="Department Expenditure Allocations"
                    subtitle="Annual operational budget usage per department"
                    data={financeData.departmentExpenses}
                    height={260}
                  />
                  <EnterpriseChartEngine
                    type="bar"
                    title="Outstanding Dues by Department"
                    subtitle="Pending tuition fees awaiting reconciliation"
                    data={financeData.outstandingFeesByDept}
                    height={260}
                  />
                </div>
              )}

              {selectedDomainTab === 'faculty' && facultyData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <EnterpriseChartEngine
                    type="donut"
                    title="Faculty Workload Allocation"
                    subtitle="Percentage time split across core academic responsibilities"
                    data={facultyData.workloadDistribution}
                    height={260}
                  />
                  <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 flex flex-col justify-between">
                    <h3 className="text-base font-semibold text-white">Research & Citation Metrics</h3>
                    <div className="grid grid-cols-2 gap-4 my-auto pt-2">
                      <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                        <span className="text-xs text-slate-400">Scopus Publications</span>
                        <p className="text-2xl font-bold text-brand-400 mt-1">{facultyData.researchPublicationsCount}</p>
                      </div>
                      <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                        <span className="text-xs text-slate-400">Total Scopus Citations</span>
                        <p className="text-2xl font-bold text-emerald-400 mt-1">{facultyData.scopusCitations}</p>
                      </div>
                      <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                        <span className="text-xs text-slate-400">Institutional H-Index</span>
                        <p className="text-2xl font-bold text-white mt-1">{facultyData.googleScholarHIndex}</p>
                      </div>
                      <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                        <span className="text-xs text-slate-400">Patents Granted/Filed</span>
                        <p className="text-2xl font-bold text-purple-400 mt-1">{facultyData.patentsFiled}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedDomainTab === 'library' && libraryData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <EnterpriseChartEngine
                    type="bar"
                    title="Most Borrowed Library Volumes"
                    subtitle="Top academic textbooks by issue frequency"
                    data={libraryData.mostBorrowedBooks}
                    height={260}
                  />
                  <EnterpriseChartEngine
                    type="donut"
                    title="Digital Journal & E-Book Category Breakdown"
                    subtitle="Active digital library usage by domain"
                    data={libraryData.categoryUsageBreakdown}
                    height={260}
                  />
                </div>
              )}

              {selectedDomainTab === 'hostel' && hostelData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <EnterpriseChartEngine
                    type="bar"
                    title="Hostel Block Occupancy %"
                    subtitle="Real-time resident capacity by hostel block"
                    data={hostelData.roomUtilizationByBlock}
                    height={260}
                  />
                  <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 flex flex-col justify-between">
                    <h3 className="text-base font-semibold text-white">Hostel Operations Summary</h3>
                    <div className="grid grid-cols-2 gap-4 my-auto pt-2">
                      <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                        <span className="text-xs text-slate-400">Mess Fees Collected</span>
                        <p className="text-xl font-bold text-emerald-400 mt-1">₹{(hostelData.messFeeCollected / 100000).toFixed(1)} L</p>
                      </div>
                      <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                        <span className="text-xs text-slate-400">Tickets Resolved</span>
                        <p className="text-xl font-bold text-white mt-1">{hostelData.maintenanceTicketsResolved}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedDomainTab === 'transport' && transportData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <EnterpriseChartEngine
                    type="bar"
                    title="Bus Route Maintenance Expenses"
                    subtitle="Monthly servicing costs per fleet vehicle"
                    data={transportData.maintenanceCostByVehicle}
                    height={260}
                  />
                  <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 flex flex-col justify-between">
                    <h3 className="text-base font-semibold text-white">Fleet Performance Metrics</h3>
                    <div className="grid grid-cols-2 gap-4 my-auto pt-2">
                      <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                        <span className="text-xs text-slate-400">Driver Score</span>
                        <p className="text-2xl font-bold text-emerald-400 mt-1">{transportData.driverPerformanceScore}/100</p>
                      </div>
                      <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                        <span className="text-xs text-slate-400">Route Efficiency</span>
                        <p className="text-2xl font-bold text-brand-400 mt-1">{transportData.routeEfficiencyIndex}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedDomainTab === 'exam' && examData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <EnterpriseChartEngine
                    type="bar"
                    title="Department Academic Ranking (Avg CGPA)"
                    subtitle="Comparative performance index across departments"
                    data={examData.departmentRankings}
                    height={260}
                  />
                  <EnterpriseChartEngine
                    type="donut"
                    title="Bloom's Taxonomy Question Distribution"
                    subtitle="Cognitive level coverage across end-sem question papers"
                    data={examData.bloomsTaxonomyCoverage}
                    height={260}
                  />
                </div>
              )}

              {selectedDomainTab === 'hr' && hrData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <EnterpriseChartEngine
                    type="line"
                    title="Monthly Faculty Payroll Disbursal"
                    subtitle="Total salary disbursements over recent months"
                    data={hrData.monthlyPayrollTrend}
                    height={260}
                  />
                  <EnterpriseChartEngine
                    type="bar"
                    title="Leave Days Claimed by Department"
                    subtitle="Cumulative faculty leaves recorded"
                    data={hrData.leaveStatisticsByDept}
                    height={260}
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AI & ML PREDICTIVE HUB */}
          {activeTab === 'aiHub' && (
            <div className="space-y-6">
              {/* AI Model Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aiMetrics.map((m, idx) => (
                  <div key={idx} className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">{m.modelName}</span>
                      <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        Samples: {m.trainingSamples.toLocaleString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                      <div>
                        <span className="text-slate-400">Accuracy:</span>
                        <p className="text-lg font-bold text-emerald-400">{m.accuracy}%</p>
                      </div>
                      <div>
                        <span className="text-slate-400">F1 Score:</span>
                        <p className="text-lg font-bold text-white">{m.f1Score}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Predictive Risk Cards */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-400" /> Active Machine Learning Risk Inferences
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {aiPredictions.map((pred) => (
                    <div
                      key={pred.id}
                      className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 shadow-lg space-y-4 flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-xs text-slate-400 font-medium">{pred.predictionType}</span>
                          <h4 className="text-base font-bold text-white mt-0.5">{pred.targetName}</h4>
                          <p className="text-xs text-slate-400">{pred.department}</p>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase ${
                            pred.riskLevel === 'HIGH'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : pred.riskLevel === 'MEDIUM'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {pred.riskLevel} RISK
                        </span>
                      </div>

                      {/* Model & Confidence */}
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs space-y-1.5">
                        <div className="flex justify-between text-slate-300">
                          <span>Model Algorithm:</span>
                          <span className="font-semibold text-brand-400">{pred.modelUsed}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Prediction Confidence:</span>
                          <span className="font-bold text-emerald-400">{pred.confidenceScore}%</span>
                        </div>
                      </div>

                      {/* Feature Importance */}
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          Key Risk Drivers (Feature Importance):
                        </span>
                        <div className="space-y-1.5 mt-2">
                          {pred.featureImportance.map((f, i) => (
                            <div key={i} className="flex items-center justify-between text-xs text-slate-300">
                              <span className="truncate max-w-[180px]">{f.feature}</span>
                              <span className="font-mono text-slate-400">{Math.round(f.weight * 100)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* AI Action Recommendation */}
                      <div className="p-3 bg-brand-950/40 rounded-lg border border-brand-800/40 text-xs text-brand-300">
                        <span className="font-semibold block mb-0.5 text-brand-200">Recommended Action:</span>
                        {pred.recommendation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NATURAL LANGUAGE BI SEARCH */}
          {activeTab === 'nlSearch' && (
            <div className="space-y-6">
              <AISearchAssistant />
            </div>
          )}

          {/* TAB 5: REPORT ENGINE & SCHEDULES */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    <FileText className="w-5 h-5 text-brand-400" /> Automated Scheduled Report Dispatcher
                  </h3>
                  <button
                    onClick={() => alert('New Automated Scheduled Report Workflow Created.')}
                    className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    + Schedule New Report
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300 border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold">
                        <th className="py-3 px-4">Report Name</th>
                        <th className="py-3 px-4">ERP Module</th>
                        <th className="py-3 px-4">Format</th>
                        <th className="py-3 px-4">Frequency</th>
                        <th className="py-3 px-4">Recipients</th>
                        <th className="py-3 px-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {reports.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 font-semibold text-white">{r.reportName}</td>
                          <td className="py-3 px-4 text-slate-300">{r.module}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded font-mono font-bold bg-slate-800 text-slate-200">
                              {r.format}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-300">{r.frequency}</td>
                          <td className="py-3 px-4 text-slate-400 font-mono text-[11px] truncate max-w-[200px]">
                            {r.recipients.join(', ')}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
