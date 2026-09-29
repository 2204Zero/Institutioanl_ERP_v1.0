/**
 * Student Domain Types for Educational ERP
 * Enterprise 360° Student Information System (SIS) Data Structure
 */

export type Gender = 'Male' | 'Female' | 'Other';
export type AcademicStatus = 'Active' | 'Suspended' | 'Graduated' | 'OnLeave' | 'Alumni';
export type FeeStatus = 'Paid' | 'Pending' | 'Overdue' | 'Exempted';
export type AdmissionStatus = 'Approved' | 'Under Review' | 'Provisionally Admitted' | 'Enrolled' | 'Rejected';

export interface StudentDocument {
  id: string;
  name: string;
  type: string;
  fileSize: string;
  uploadedAt: string;
  status: 'Verified' | 'Pending' | 'Rejected';
  url: string;
}

export interface StudentGuardian {
  name: string;
  relation: string;
  phone: string;
  email: string;
  occupation?: string;
}

export interface StudentAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface StudentMedicalInfo {
  bloodGroup: string;
  allergies?: string;
  medicalConditions?: string;
  emergencyDoctorPhone?: string;
}

export interface Student {
  id: string;
  rollNo: string;
  regNo?: string;
  name: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email: string;
  phone: string;
  department: string;
  course?: string;
  semester: string;
  section?: string;
  batch?: string;
  gender?: Gender;
  dob?: string;
  bloodGroup?: string;
  nationality?: string;
  category?: string;
  religion?: string;
  aadhaarNo?: string;
  passportNo?: string;
  status: AcademicStatus;
  admissionStatus?: AdmissionStatus;
  admissionYear?: number;
  feesStatus?: FeeStatus;
  cgpa: number;
  sgpa?: number;
  totalPaid: number;
  totalDues: number;
  guardian?: StudentGuardian;
  permanentAddress?: StudentAddress;
  correspondenceAddress?: StudentAddress;
  medicalInfo?: StudentMedicalInfo;
  hostelRoom?: string;
  transportRoute?: string;
  scholarshipDetails?: string;
  avatarUrl?: string;
  documents?: StudentDocument[];
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
  regNo?: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  course: string;
  semester: string;
  gender: Gender;
  admissionYear: number;
  cgpa?: number;
  guardianName?: string;
  guardianPhone?: string;
  bloodGroup?: string;
  category?: string;
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
  hostelRoom?: string;
  transportRoute?: string;
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
