export interface Guardian {
  id: number;
  studentId?: number;
  studentName?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  relation: string; // FATHER, MOTHER, LEGAL_GUARDIAN, OTHER
  phone: string;
  email?: string;
  occupation?: string;
  address?: string;
  isEmergencyContact: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GuardianFormData {
  studentId?: number;
  firstName: string;
  lastName: string;
  relation: string;
  phone: string;
  email?: string;
  occupation?: string;
  address?: string;
  isEmergencyContact?: boolean;
}
