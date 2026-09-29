// Institutional ERP Suite — Phase 7 HRMS & Payroll Service Engine

import {
  Employee,
  JobPosting,
  CandidateApplication,
  HRAttendanceRecord,
  LeaveApplication,
  LeaveBalance,
  Payslip,
  PerformanceReview,
  HRKPIs,
} from '../types/hrTypes';

/**
 * Spring Boot stdout terminal audit logger for HR & Payroll events.
 */
export function logHRAction(event: {
  user: string;
  action: string;
  employeeId?: string;
  department?: string;
  month?: string;
  netSalary?: number;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'REJECTED';
  durationMs?: number;
  details?: string;
}): void {
  const duration = event.durationMs || Math.floor(25 + Math.random() * 55);
  const formattedLog = `[HR]\nUser: ${event.user}\nAction: ${event.action}${
    event.employeeId ? `\nEmployee: ${event.employeeId}` : ''
  }${event.department ? `\nDepartment: ${event.department}` : ''}${
    event.month ? `\nMonth: ${event.month}` : ''
  }${event.netSalary !== undefined ? `\nNet Salary: ₹${event.netSalary.toLocaleString('en-IN')}` : ''}\nStatus: ${event.status}\nDuration: ${duration}ms${
    event.details ? `\nDetails: ${event.details}` : ''
  }`;

  console.log(`%c${formattedLog}`, 'color: #3b82f6; font-weight: bold;');
}

const mockEmployees: Employee[] = [
  {
    id: 'emp-1',
    employeeId: 'EMP-2026-0148',
    name: 'Dr. Sunita Rao',
    email: 'sunita.rao@nits.edu',
    phone: '+91 98765 80120',
    category: 'FACULTY',
    status: 'CONFIRMED',
    department: 'Computer Science',
    designation: 'Professor & Head',
    jobGrade: '7th Pay Level 14',
    joiningDate: '2018-07-15',
    salaryBasic: 144200,
    salaryGross: 218500,
    bankAccountNo: 'SBI-90182736412',
    ifscCode: 'SBIN0001042',
    panNumber: 'ABCDE1234F',
    aadhaarNumber: '1234-5678-9012',
    emergencyContact: { name: 'Dr. V. Rao', relationship: 'Spouse', phone: '+91 98765 00011' },
    documents: [
      { id: 'doc-1', title: 'PhD Certificate IISc', category: 'EDUCATION', fileUrl: '/docs/phd_sunita.pdf', uploadedAt: '2018-07-15' },
      { id: 'doc-2', title: 'PAN Card Copy', category: 'IDENTIFICATION', fileUrl: '/docs/pan_sunita.pdf', uploadedAt: '2018-07-15' },
    ],
  },
  {
    id: 'emp-2',
    employeeId: 'EMP-2026-0149',
    name: 'Prof. Ramesh Kumar',
    email: 'ramesh.k@nits.edu',
    phone: '+91 98765 80150',
    category: 'FACULTY',
    status: 'CONFIRMED',
    department: 'Electronics',
    designation: 'Associate Professor',
    jobGrade: '7th Pay Level 13A',
    joiningDate: '2020-01-10',
    salaryBasic: 131400,
    salaryGross: 198200,
    bankAccountNo: 'HDFC-8819201928',
    ifscCode: 'HDFC0000182',
    panNumber: 'FGHIJ5678K',
    aadhaarNumber: '9876-5432-1098',
    emergencyContact: { name: 'Sunita Kumar', relationship: 'Spouse', phone: '+91 98765 00022' },
    documents: [
      { id: 'doc-3', title: 'M.Tech IIT Madras', category: 'EDUCATION', fileUrl: '/docs/mtech_ramesh.pdf', uploadedAt: '2020-01-10' },
    ],
  },
];

const mockJobPostings: JobPosting[] = [
  {
    id: 'job-1',
    jobCode: 'JOB-2026-CS01',
    title: 'Assistant Professor (AI & Machine Learning)',
    department: 'Computer Science',
    category: 'FACULTY',
    vacanciesCount: 3,
    minExperienceYears: 3,
    qualification: 'Ph.D. in Computer Science / AI',
    postedDate: '2026-09-01',
    status: 'INTERVIEWING',
  },
  {
    id: 'job-2',
    jobCode: 'JOB-2026-EC02',
    title: 'Lab Technical Officer (VLSI Systems)',
    department: 'Electronics',
    category: 'NON_TEACHING',
    vacanciesCount: 2,
    minExperienceYears: 2,
    qualification: 'B.Tech / M.Tech in ECE',
    postedDate: '2026-09-10',
    status: 'OPEN',
  },
];

const mockCandidates: CandidateApplication[] = [
  {
    id: 'cand-1',
    candidateName: 'Dr. Vivek Sharma',
    email: 'vivek.ai@gmail.com',
    phone: '+91 98112 33445',
    jobCode: 'JOB-2026-CS01',
    jobTitle: 'Assistant Professor (AI & Machine Learning)',
    stage: 'INTERVIEW_SCHEDULED',
    interviewDate: '2026-10-02 10:00 AM',
    interviewerName: 'Dr. Sunita Rao (HOD CS)',
    ratingScore: 4.8,
  },
];

const mockAttendance: HRAttendanceRecord[] = [
  {
    id: 'att-1',
    employeeId: 'EMP-2026-0148',
    employeeName: 'Dr. Sunita Rao',
    date: '2026-09-28',
    checkInTime: '08:52 AM',
    checkOutTime: '05:15 PM',
    workHours: 8.38,
    mode: 'BIOMETRIC',
    status: 'PRESENT',
    overtimeHours: 0,
  },
];

const mockLeaveApps: LeaveApplication[] = [
  {
    id: 'lv-1',
    applicationNo: 'LA-2026-091',
    employeeId: 'EMP-2026-0149',
    employeeName: 'Prof. Ramesh Kumar',
    leaveType: 'CASUAL',
    startDate: '2026-10-05',
    endDate: '2026-10-06',
    totalDays: 2,
    reason: 'Attending IEEE VLSI Conference in Bengaluru',
    status: 'PENDING',
    appliedOn: '2026-09-25',
  },
];

const mockPayslips: Payslip[] = [
  {
    id: 'pay-1',
    payslipNumber: 'PAY-2026-09-0148',
    employeeId: 'EMP-2026-0148',
    employeeName: 'Dr. Sunita Rao',
    department: 'Computer Science',
    designation: 'Professor & Head',
    monthYear: 'September 2026',
    basicPay: 144200,
    hra: 34608,
    da: 72100,
    transportAllowance: 7200,
    specialAllowance: 10000,
    grossSalary: 268108,
    providentFundDeduction: 17304,
    professionalTax: 208,
    incomeTaxDeduction: 32000,
    totalDeductions: 49512,
    netSalary: 218596,
    status: 'PROCESSED',
    paymentDate: '2026-09-30',
  },
];

const mockReviews: PerformanceReview[] = [
  {
    id: 'rev-1',
    employeeId: 'EMP-2026-0148',
    employeeName: 'Dr. Sunita Rao',
    academicYear: '2025-2026',
    kpiScore: 94,
    researchScore: 88,
    publicationCount: 6,
    patentCount: 2,
    studentFeedbackRating: 4.9,
    overallRating: 'EXCEPTIONAL',
    promotionRecommendation: true,
    incrementPercentage: 10,
    reviewedBy: 'Academic Deanship Committee',
  },
];

export class HRService {
  public static getKPIs(): HRKPIs {
    return {
      totalEmployees: 340,
      facultyCount: 210,
      nonTeachingCount: 130,
      monthlyPayrollCost: 19500000,
      averageAttendancePercentage: 96.4,
      pendingLeavesCount: 12,
      openVacanciesCount: 8,
      averagePerformanceRating: 4.8,
    };
  }

  public static getEmployees(): Employee[] {
    return mockEmployees;
  }

  public static registerEmployee(data: Omit<Employee, 'id' | 'employeeId'>): Employee {
    const employeeId = `EMP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newEmp: Employee = {
      ...data,
      id: `emp-${Date.now()}`,
      employeeId,
    };
    mockEmployees.unshift(newEmp);

    logHRAction({
      user: 'HR Admin',
      action: 'Employee Onboarding & ID Generated',
      employeeId,
      department: newEmp.department,
      status: 'SUCCESS',
      details: `Registered ${newEmp.name} as ${newEmp.designation}`,
    });

    return newEmp;
  }

  public static getJobPostings(): JobPosting[] {
    return mockJobPostings;
  }

  public static getCandidates(): CandidateApplication[] {
    return mockCandidates;
  }

  public static getAttendanceRecords(): HRAttendanceRecord[] {
    return mockAttendance;
  }

  public static getLeaveApplications(): LeaveApplication[] {
    return mockLeaveApps;
  }

  public static approveLeave(id: string, approvedBy: string): void {
    const app = mockLeaveApps.find((l) => l.id === id);
    if (app) {
      app.status = 'APPROVED';
      app.approvedBy = approvedBy;

      logHRAction({
        user: approvedBy,
        action: 'Leave Application Approved',
        employeeId: app.employeeId,
        status: 'SUCCESS',
        details: `Approved ${app.totalDays} day(s) ${app.leaveType} leave`,
      });
    }
  }

  public static processMonthlyPayroll(monthYear: string): Payslip[] {
    logHRAction({
      user: 'Chief HR Officer',
      action: 'Payroll Processed',
      month: monthYear,
      netSalary: 19500000,
      status: 'SUCCESS',
      durationMs: 63,
      details: `Disbursed monthly salary batch for 340 active faculty & staff`,
    });

    return mockPayslips;
  }

  public static getPayslips(): Payslip[] {
    return mockPayslips;
  }

  public static getPerformanceReviews(): PerformanceReview[] {
    return mockReviews;
  }

  public static getEmployeeLeaveBalance(employeeId: string): LeaveBalance {
    return {
      casualLeave: 8,
      medicalLeave: 10,
      earnedLeave: 15,
      studyLeave: 30,
    };
  }
}
