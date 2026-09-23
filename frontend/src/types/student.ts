import { Guardian } from './guardian';
import { StudentDocument } from './document';

export type StudentStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'GRADUATED' | 'ALUMNI';

export interface Student {
  id: number;
  rollNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  department: string;
  program?: string;
  batch: string;
  enrollmentDate: string;
  status: StudentStatus;
  guardians?: Guardian[];
  documents?: StudentDocument[];
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentFormData {
  rollNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  department: string;
  program?: string;
  batch: string;
  enrollmentDate: string;
  status?: StudentStatus;
}

export interface StudentStatusUpdatePayload {
  status: StudentStatus;
  reason?: string;
  changedBy?: string;
}

export interface StudentStatusHistoryItem {
  id: number;
  previousStatus?: StudentStatus;
  newStatus: StudentStatus;
  reason?: string;
  changedBy?: string;
  changedAt: string;
}
