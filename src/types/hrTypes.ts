// Institutional ERP Suite — Phase 7 HRMS, Payroll & Employee Lifecycle Types

export type EmployeeCategory =
  | 'FACULTY'
  | 'NON_TEACHING'
  | 'CONTRACT'
  | 'VISITING'
  | 'GUEST'
  | 'RESEARCH';

export type EmploymentStatus =
  | 'JOINING'
  | 'PROBATION'
  | 'CONFIRMED'
  | 'TRANSFERRED'
  | 'PROMOTED'
  | 'SUSPENDED'
  | 'RESIGNED'
  | 'RETIRED'
  | 'TERMINATED'
  | 'REHIRED'
  | 'ALUMNI_FACULTY';

export interface EmployeeDocument {
  id: string;
  title: string;
  category: 'EDUCATION' | 'EXPERIENCE' | 'IDENTIFICATION' | 'CERTIFICATE' | 'TAX';
  fileUrl: string;
  uploadedAt: string;
}

export interface Employee {
  id: string;
  employeeId: string; // 'EMP-2026-0148'
  name: string;
  email: string;
  phone: string;
  category: EmployeeCategory;
  status: EmploymentStatus;
  department: string;
  designation: string;
  jobGrade: string; // '7th Pay Level 14'
  joiningDate: string;
  confirmationDate?: string;
  salaryBasic: number;
  salaryGross: number;
  bankAccountNo: string;
  ifscCode: string;
  panNumber: string;
  aadhaarNumber: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  documents: EmployeeDocument[];
}

export interface JobPosting {
  id: string;
  jobCode: string;
  title: string;
  department: string;
  category: EmployeeCategory;
  vacanciesCount: number;
  minExperienceYears: number;
  qualification: string;
  postedDate: string;
  status: 'OPEN' | 'INTERVIEWING' | 'CLOSED' | 'DRAFT';
}

export interface CandidateApplication {
  id: string;
  candidateName: string;
  email: string;
  phone: string;
  jobCode: string;
  jobTitle: string;
  stage: 'APPLIED' | 'SCREENED' | 'INTERVIEW_SCHEDULED' | 'OFFERED' | 'HIRED' | 'REJECTED';
  interviewDate?: string;
  interviewerName?: string;
  ratingScore?: number; // 1 to 5
}

export interface HRAttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkInTime: string;
  checkOutTime: string;
  workHours: number;
  mode: 'BIOMETRIC' | 'RFID' | 'GEO_FENCE' | 'MANUAL';
  status: 'PRESENT' | 'LATE' | 'HALF_DAY' | 'ABSENT' | 'ON_LEAVE';
  overtimeHours: number;
}

export type LeaveType =
  | 'CASUAL'
  | 'MEDICAL'
  | 'EARNED'
  | 'MATERNITY'
  | 'PATERNITY'
  | 'STUDY'
  | 'COMPENSATORY'
  | 'HALF_DAY';

export interface LeaveBalance {
  casualLeave: number;
  medicalLeave: number;
  earnedLeave: number;
  studyLeave: number;
}

export interface LeaveApplication {
  id: string;
  applicationNo: string;
  employeeId: string;
  employeeName: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedOn: string;
  approvedBy?: string;
}

export interface Payslip {
  id: string;
  payslipNumber: string; // 'PAY-2026-09-0148'
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  monthYear: string; // 'September 2026'
  basicPay: number;
  hra: number;
  da: number;
  transportAllowance: number;
  specialAllowance: number;
  grossSalary: number;
  providentFundDeduction: number;
  professionalTax: number;
  incomeTaxDeduction: number;
  totalDeductions: number;
  netSalary: number;
  status: 'PROCESSED' | 'DISBURSED' | 'HELD';
  paymentDate: string;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  academicYear: string;
  kpiScore: number; // Max 100
  researchScore: number; // Publications + Patents
  publicationCount: number;
  patentCount: number;
  studentFeedbackRating: number; // 1 to 5
  overallRating: 'EXCEPTIONAL' | 'EXCEEDS_EXPECTATIONS' | 'MEETS_EXPECTATIONS' | 'NEEDS_IMPROVEMENT';
  promotionRecommendation: boolean;
  incrementPercentage: number;
  reviewedBy: string;
}

export interface HRKPIs {
  totalEmployees: number;
  facultyCount: number;
  nonTeachingCount: number;
  monthlyPayrollCost: number;
  averageAttendancePercentage: number;
  pendingLeavesCount: number;
  openVacanciesCount: number;
  averagePerformanceRating: number;
}
