import React, { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useERP } from '../hooks/useERP';
import { HRService, logHRAction } from '../services/hrService';
import {
  Briefcase,
  Users,
  DollarSign,
  Calendar,
  CheckCircle2,
  Eye,
  UserPlus,
  Award,
  BookOpen,
  Clock,
  FileCheck,
  Building,
  TrendingUp,
  Download,
  Check,
  X,
  Filter,
} from 'lucide-react';

type HRTab =
  | 'overview'
  | 'directory'
  | 'recruitment'
  | 'attendance'
  | 'leave-mgmt'
  | 'payroll-engine'
  | 'performance'
  | 'self-service';

export const HRPage: React.FC = () => {
  const { openTeacherDetailModal, addToast } = useERP();
  const [activeTab, setActiveTab] = useState<HRTab>('overview');
  const [payrollProcessed, setPayrollProcessed] = useState(false);

  // Phase 7 Service Datasets
  const kpis = HRService.getKPIs();
  const employees = HRService.getEmployees();
  const jobPostings = HRService.getJobPostings();
  const candidates = HRService.getCandidates();
  const attendanceRecords = HRService.getAttendanceRecords();
  const leaveApps = HRService.getLeaveApplications();
  const payslips = HRService.getPayslips();
  const reviews = HRService.getPerformanceReviews();
  const essBalance = HRService.getEmployeeLeaveBalance('EMP-2026-0148');

  const handleRunPayrollBatch = () => {
    setPayrollProcessed(true);
    HRService.processMonthlyPayroll('September 2026');
    addToast(
      'Payroll Processed Successfully',
      'Disbursed ₹1.95 Cr across 340 active faculty & staff bank accounts via Direct Bank Transfer.',
      'success'
    );
  };

  const handleApproveLeaveApp = (id: string) => {
    HRService.approveLeave(id, 'Dr. Rajesh Kumar (Dean)');
    addToast('Leave Approved', 'Employee leave balance updated.', 'success');
  };

  return (
    <AppLayout>
      <div className="space-y-6 text-left">
        {/* Top Header & Sub-system Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Briefcase className="w-7 h-7 text-brand-600" /> Enterprise Human Resource Management System (HRMS)
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Phase 7 — Employee Lifecycle, ATS Recruitment, Biometric Attendance, Leave Rules, Payroll & Appraisals.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={payrollProcessed ? 'secondary' : 'primary'}
              size="sm"
              onClick={handleRunPayrollBatch}
              disabled={payrollProcessed}
            >
              <DollarSign className="w-4 h-4 mr-1.5" />
              {payrollProcessed ? 'September Payroll Processed' : 'Disburse Monthly Payroll'}
            </Button>
          </div>
        </div>

        {/* Phase 7 Enterprise Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-200">
          {[
            { id: 'overview', label: 'HR Dashboard', icon: <TrendingUp className="w-4 h-4" /> },
            { id: 'directory', label: 'Employee Directory', icon: <Users className="w-4 h-4" /> },
            { id: 'recruitment', label: 'ATS & Recruitment', icon: <UserPlus className="w-4 h-4" /> },
            { id: 'attendance', label: 'Attendance & Shifts', icon: <Clock className="w-4 h-4" /> },
            { id: 'leave-mgmt', label: 'Leave Portal', icon: <Calendar className="w-4 h-4" /> },
            { id: 'payroll-engine', label: 'Payroll & Payslips', icon: <DollarSign className="w-4 h-4" /> },
            { id: 'performance', label: 'Appraisals & Research', icon: <Award className="w-4 h-4" /> },
            { id: 'self-service', label: 'Employee Self Service', icon: <FileCheck className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as HRTab)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: EXECUTIVE HR DASHBOARD & KPIS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 border-l-4 border-l-brand-600">
                <p className="text-xs font-semibold text-slate-500 uppercase">Total Faculty & Staff</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{kpis.totalEmployees}</h3>
                <span className="text-[11px] text-emerald-600 font-medium">
                  {kpis.facultyCount} Faculty • {kpis.nonTeachingCount} Staff
                </span>
              </Card>

              <Card className="p-4 border-l-4 border-l-emerald-600">
                <p className="text-xs font-semibold text-slate-500 uppercase">Monthly Payroll Cost</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">₹ 1.95 Cr</h3>
                <span className="text-[11px] text-emerald-600 font-medium">7th Pay Commission Scale</span>
              </Card>

              <Card className="p-4 border-l-4 border-l-amber-500">
                <p className="text-xs font-semibold text-slate-500 uppercase">Pending Leave Requests</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{kpis.pendingLeavesCount}</h3>
                <span className="text-[11px] text-amber-600 font-medium">Requires Dean Signoff</span>
              </Card>

              <Card className="p-4 border-l-4 border-l-purple-600">
                <p className="text-xs font-semibold text-slate-500 uppercase">Faculty Appraisal Rating</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{kpis.averagePerformanceRating} / 5.0</h3>
                <span className="text-[11px] text-purple-600 font-medium">Top 5% Research Score</span>
              </Card>
            </div>

            {/* Quick Metrics Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-5 border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900 text-sm">Department Distribution</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span>Computer Science</span><span className="font-semibold">85 Staff</span></div>
                  <div className="flex justify-between"><span>Electronics & Communication</span><span className="font-semibold">64 Staff</span></div>
                  <div className="flex justify-between"><span>Mechanical Engineering</span><span className="font-semibold">52 Staff</span></div>
                  <div className="flex justify-between"><span>Civil & Infrastructure</span><span className="font-semibold">45 Staff</span></div>
                  <div className="flex justify-between"><span>Admin & Accounts</span><span className="font-semibold">94 Staff</span></div>
                </div>
              </Card>

              <Card className="p-5 border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900 text-sm">Recruitment & Open Vacancies</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span>Assistant Professor (AI/ML)</span><Badge variant="warning">3 Positions</Badge></div>
                  <div className="flex justify-between"><span>Technical Officer (VLSI)</span><Badge variant="info">2 Positions</Badge></div>
                  <div className="flex justify-between"><span>Research Scientist (Data Science)</span><Badge variant="purple">3 Positions</Badge></div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: EMPLOYEE DIRECTORY & LIFECYCLE */}
        {activeTab === 'directory' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Institutional Faculty & Staff Directory</h2>
                <p className="text-xs text-slate-500">Employee lifecycle statuses, profiles, digital files and designations.</p>
              </div>
              <Button
                variant="primary"
                className="text-xs"
                onClick={() => {
                  logHRAction({
                    user: 'HR Manager',
                    action: 'Initiated Employee Registration Wizard',
                    status: 'SUCCESS',
                  });
                  addToast('Employee Wizard', 'Opening Registration Form...', 'info');
                }}
              >
                <UserPlus className="w-4 h-4 mr-1" /> Register Employee
              </Button>
            </div>

            <Card className="p-0 overflow-hidden border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Employee ID</th>
                    <th className="p-3.5">Name & Email</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5">Designation</th>
                    <th className="p-3.5">Pay Grade</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/80">
                      <td className="p-3.5 font-mono font-bold text-brand-600">{emp.employeeId}</td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-900">{emp.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{emp.email}</div>
                      </td>
                      <td className="p-3.5 font-medium">{emp.department}</td>
                      <td className="p-3.5">{emp.designation}</td>
                      <td className="p-3.5 font-medium text-emerald-600">{emp.jobGrade}</td>
                      <td className="p-3.5"><Badge variant="success">{emp.status}</Badge></td>
                      <td className="p-3.5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            logHRAction({
                              user: 'HR Manager',
                              action: 'Viewed Employee Digital File',
                              employeeId: emp.employeeId,
                              status: 'SUCCESS',
                            });
                            openTeacherDetailModal({
                              id: emp.id,
                              name: emp.name,
                              employeeId: emp.employeeId,
                              email: emp.email,
                              department: emp.department,
                              designation: emp.designation,
                              subjects: ['Advanced Database Systems', 'Cloud Architecture'],
                              salaryGrade: emp.jobGrade,
                            });
                          }}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" /> Profile
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* TAB 3: RECRUITMENT & ATS PIPELINE */}
        {activeTab === 'recruitment' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Applicant Tracking System (ATS)</h2>
                <p className="text-xs text-slate-500">Job postings, candidate screening, interview scheduling and offer letters.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-5 border border-slate-200 space-y-4">
                <h3 className="font-bold text-slate-900 text-sm">Active Job Openings</h3>
                <div className="space-y-3">
                  {jobPostings.map((job) => (
                    <div key={job.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-mono font-bold text-[10px] text-slate-500">{job.jobCode}</span>
                        <h4 className="font-bold text-xs text-slate-900">{job.title}</h4>
                        <p className="text-[11px] text-slate-500">{job.department} • {job.vacanciesCount} Vacancies</p>
                      </div>
                      <Badge variant="info">{job.status}</Badge>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-5 border border-slate-200 space-y-4">
                <h3 className="font-bold text-slate-900 text-sm">Candidate Applications Pipeline</h3>
                <div className="space-y-3">
                  {candidates.map((cand) => (
                    <div key={cand.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">{cand.candidateName}</span>
                        <Badge variant="purple">{cand.stage}</Badge>
                      </div>
                      <p className="text-xs text-slate-600">{cand.jobTitle}</p>
                      <p className="text-[11px] text-slate-500">Scheduled: {cand.interviewDate} with {cand.interviewerName}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 4: BIOMETRIC ATTENDANCE & SHIFTS */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Biometric & RFID Attendance Tracking</h2>
                <p className="text-xs text-slate-500">Real-time gate logs, geo-fenced mobile check-ins and overtime calculations.</p>
              </div>
            </div>

            <Card className="p-0 overflow-hidden border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Employee ID</th>
                    <th className="p-3.5">Employee Name</th>
                    <th className="p-3.5">In Time</th>
                    <th className="p-3.5">Out Time</th>
                    <th className="p-3.5">Work Hours</th>
                    <th className="p-3.5">Mode</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendanceRecords.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-50/80">
                      <td className="p-3.5 font-medium">{att.date}</td>
                      <td className="p-3.5 font-mono font-bold text-slate-700">{att.employeeId}</td>
                      <td className="p-3.5 font-semibold text-slate-900">{att.employeeName}</td>
                      <td className="p-3.5 text-emerald-600 font-medium">{att.checkInTime}</td>
                      <td className="p-3.5 text-slate-600">{att.checkOutTime}</td>
                      <td className="p-3.5 font-bold">{att.workHours} hrs</td>
                      <td className="p-3.5"><Badge variant="neutral">{att.mode}</Badge></td>
                      <td className="p-3.5"><Badge variant="success">{att.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* TAB 5: LEAVE MANAGEMENT PORTAL */}
        {activeTab === 'leave-mgmt' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Leave Applications & Approval Workflow</h2>
                <p className="text-xs text-slate-500">Casual, Medical, Earned, Study leave requests and leave balance ledger.</p>
              </div>
            </div>

            <div className="space-y-4">
              {leaveApps.map((lv) => (
                <Card key={lv.id} className="p-4 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-slate-900">{lv.applicationNo}</span>
                      <Badge variant="purple">{lv.leaveType}</Badge>
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">{lv.employeeName} ({lv.employeeId})</h4>
                    <p className="text-xs text-slate-500">
                      Dates: <span className="font-semibold text-slate-700">{lv.startDate}</span> to <span className="font-semibold text-slate-700">{lv.endDate}</span> ({lv.totalDays} Days)
                    </p>
                    <p className="text-xs italic text-slate-600">"{lv.reason}"</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant={lv.status === 'APPROVED' ? 'success' : 'warning'}>{lv.status}</Badge>
                    {lv.status !== 'APPROVED' && (
                      <Button variant="primary" className="text-xs bg-emerald-600 hover:bg-emerald-700" onClick={() => handleApproveLeaveApp(lv.id)}>
                        <Check className="w-3.5 h-3.5 mr-1" /> Approve Request
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: PAYROLL ENGINE & PAYSLIPS */}
        {activeTab === 'payroll-engine' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Monthly Payroll & Payslip Register</h2>
                <p className="text-xs text-slate-500">7th Pay Commission scale, PF/ESI deductions, and Direct Bank Deposit files.</p>
              </div>
            </div>

            <Card className="p-0 overflow-hidden border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Payslip #</th>
                    <th className="p-3.5">Employee Details</th>
                    <th className="p-3.5">Basic Pay</th>
                    <th className="p-3.5">Gross Pay</th>
                    <th className="p-3.5">Deductions</th>
                    <th className="p-3.5">Net Salary</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payslips.map((ps) => (
                    <tr key={ps.id} className="hover:bg-slate-50/80">
                      <td className="p-3.5 font-bold text-brand-600">{ps.payslipNumber}</td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-900">{ps.employeeName}</div>
                        <div className="text-[11px] text-slate-400">{ps.employeeId} • {ps.department}</div>
                      </td>
                      <td className="p-3.5">₹{ps.basicPay.toLocaleString('en-IN')}</td>
                      <td className="p-3.5 font-medium">₹{ps.grossSalary.toLocaleString('en-IN')}</td>
                      <td className="p-3.5 text-rose-600">₹{ps.totalDeductions.toLocaleString('en-IN')}</td>
                      <td className="p-3.5 text-emerald-600 font-bold">₹{ps.netSalary.toLocaleString('en-IN')}</td>
                      <td className="p-3.5"><Badge variant="success">{ps.status}</Badge></td>
                      <td className="p-3.5 text-right">
                        <Button
                          variant="secondary"
                          className="text-[11px] py-1 px-2"
                          onClick={() => {
                            logHRAction({
                              user: 'Employee / HR',
                              action: 'Downloaded Payslip PDF',
                              employeeId: ps.employeeId,
                              month: ps.monthYear,
                              netSalary: ps.netSalary,
                              status: 'SUCCESS',
                            });
                            addToast('Payslip Downloaded', `Payslip ${ps.payslipNumber} saved.`, 'info');
                          }}
                        >
                          <Download className="w-3.5 h-3.5 mr-1" /> Payslip
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* TAB 7: PERFORMANCE APPRAISALS & RESEARCH */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Faculty Appraisals & Research Ratings</h2>
                <p className="text-xs text-slate-500">Publications, Patent filings, Student ratings and promotion recommendations.</p>
              </div>
            </div>

            <div className="space-y-4">
              {reviews.map((rev) => (
                <Card key={rev.id} className="p-5 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{rev.employeeName} ({rev.employeeId})</h3>
                      <p className="text-xs text-slate-500">Academic Year: {rev.academicYear} • Reviewed by {rev.reviewedBy}</p>
                    </div>
                    <Badge variant="purple">{rev.overallRating}</Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg text-xs">
                    <div><span className="text-slate-500">KPI Score:</span> <span className="font-bold text-slate-900">{rev.kpiScore}/100</span></div>
                    <div><span className="text-slate-500">Publications:</span> <span className="font-bold text-slate-900">{rev.publicationCount} Papers</span></div>
                    <div><span className="text-slate-500">Patents Filed:</span> <span className="font-bold text-slate-900">{rev.patentCount} Patents</span></div>
                    <div><span className="text-slate-500">Student Rating:</span> <span className="font-bold text-emerald-600">{rev.studentFeedbackRating}/5.0</span></div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: EMPLOYEE SELF SERVICE (ESS) */}
        {activeTab === 'self-service' && (
          <div className="space-y-6">
            <div className="bg-slate-900 text-white p-5 rounded-xl shadow-lg flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">Employee Self Service Portal</span>
                <h3 className="text-xl font-extrabold mt-0.5">Dr. Sunita Rao (EMP-2026-0148)</h3>
                <p className="text-xs text-slate-300">Professor & Head • Department of Computer Science</p>
              </div>

              <div className="flex gap-2">
                <Button variant="secondary" className="text-xs" onClick={() => addToast('Payslip Downloaded', 'September Payslip saved.', 'success')}>
                  <Download className="w-3.5 h-3.5 mr-1" /> Download Payslip
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-5 border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900 text-sm">Leave Balance Summary</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded border"><span className="text-slate-500">Casual Leave</span><div className="text-lg font-bold text-slate-900">{essBalance.casualLeave} Days</div></div>
                  <div className="p-3 bg-slate-50 rounded border"><span className="text-slate-500">Medical Leave</span><div className="text-lg font-bold text-slate-900">{essBalance.medicalLeave} Days</div></div>
                  <div className="p-3 bg-slate-50 rounded border"><span className="text-slate-500">Earned Leave</span><div className="text-lg font-bold text-slate-900">{essBalance.earnedLeave} Days</div></div>
                  <div className="p-3 bg-slate-50 rounded border"><span className="text-slate-500">Study Leave</span><div className="text-lg font-bold text-slate-900">{essBalance.studyLeave} Days</div></div>
                </div>
              </Card>

              <Card className="p-5 border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900 text-sm">Tax & Form 16 Documents</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded"><span>Form 16 (FY 2025-26)</span><Button variant="ghost" size="sm"><Download className="w-3.5 h-3.5" /></Button></div>
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded"><span>Investment Declaration Certificate</span><Button variant="ghost" size="sm"><Download className="w-3.5 h-3.5" /></Button></div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
