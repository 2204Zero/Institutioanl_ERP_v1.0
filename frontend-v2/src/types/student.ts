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
  status: 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'DROPOUT' | 'SUSPENDED';
  createdAt?: string;
  updatedAt?: string;
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
