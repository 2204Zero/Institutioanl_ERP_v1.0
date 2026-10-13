export type StudentStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'GRADUATED' | 'ALUMNI' | 'DROPPED' | 'TRANSFERRED';

export interface Student {
  id: number;
  rollNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string; // ISO format date string (YYYY-MM-DD)
  gender: string;
  bloodGroup?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  department: string;
  program?: string;
  batch: string;
  enrollmentDate: string; // ISO format date string (YYYY-MM-DD)
  status: StudentStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentStatusHistory {
  id: number;
  previousStatus: StudentStatus | null;
  newStatus: StudentStatus;
  reason: string;
  changedBy: string;
  effectiveDate: string;
  changedAt: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}
