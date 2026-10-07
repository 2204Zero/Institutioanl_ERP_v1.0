/**
 * Student Domain Types for Educational ERP
 */

export type Gender = 'Male' | 'Female' | 'Other';
export type AcademicStatus = 'Active' | 'Suspended' | 'Graduated' | 'OnLeave';
export type FeeStatus = 'Paid' | 'Pending' | 'Overdue' | 'Exempted';

export interface Student {
  id: string;
  rollNo: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  course?: string;
  semester: string;
  gender?: Gender;
  status: AcademicStatus;
  admissionYear?: number;
  feesStatus?: FeeStatus;
  cgpa: number;
  totalPaid: number;
  totalDues: number;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Enterprise Single Student Response Contract
 */
export interface StudentResponse {
  student: Student;
}

export interface CreateStudentDTO {
  rollNo: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  course: string;
  semester: string;
  gender: Gender;
  admissionYear: number;
  cgpa?: number;
}

export interface UpdateStudentDTO {
  name?: string;
  email?: string;
  phone?: string;
  department?: string;
  course?: string;
  semester?: string;
  status?: AcademicStatus;
  feesStatus?: FeeStatus;
  cgpa?: number;
}

export interface StudentFilter {
  department?: string;
  course?: string;
  semester?: string;
  gender?: Gender;
  status?: AcademicStatus;
  admissionYear?: number;
  feesStatus?: FeeStatus;
}

export interface StudentSort {
  field: keyof Student;
  order: 'asc' | 'desc';
}
