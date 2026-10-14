export interface GuardianRequestDto {
  studentId?: number;
  firstName: string;
  lastName: string;
  relation: string;
  phone: string;
  email?: string;
  occupation?: string;
  address?: string;
  isEmergencyContact: boolean;
}

export interface GuardianResponseDto {
  id: number;
  studentId?: number;
  studentName?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  relation: string;
  phone: string;
  email?: string;
  occupation?: string;
  address?: string;
  isEmergencyContact: boolean;
  createdAt: string;
  userId?: number;
}
