import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../config/api';
import type { Student, PaginatedResponse } from '../../types/student';

// Type definitions for API responses based on our backend investigation
export interface Guardian {
  id: number;
  studentId: number;
  firstName: string;
  lastName: string;
  relation: string;
  phone: string;
  email?: string;
  occupation?: string;
}

export interface StudentDocument {
  id: number;
  studentId: number;
  documentType: string;
  fileName: string;
  originalFileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
}

// Hooks
export const useStudents = (filters?: { page?: number; size?: number; search?: string }) => {
  return useQuery({
    queryKey: ['students', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.size) params.append('size', filters.size.toString());
      // The backend StudentController might use a simple list or pagination. We assume pagination as typical Spring Boot returns.
      const response = await apiClient.get<PaginatedResponse<Student>>('/students', { params });
      return response.data;
    },
  });
};

export const useStudent = (id?: number) => {
  return useQuery({
    queryKey: ['students', id],
    queryFn: async () => {
      const response = await apiClient.get<Student>(`/students/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useStudentGuardians = (studentId?: number) => {
  return useQuery({
    queryKey: ['guardians', studentId],
    queryFn: async () => {
      // Backend mapped to: /api/v1/students/{studentId}/guardians
      const response = await apiClient.get<Guardian[]>(`/students/${studentId}/guardians`);
      return response.data;
    },
    enabled: !!studentId,
  });
};

export const useStudentDocuments = (studentId?: number) => {
  return useQuery({
    queryKey: ['documents', studentId],
    queryFn: async () => {
      // Backend mapped to: /api/v1/students/{studentId}/documents
      const response = await apiClient.get<StudentDocument[]>(`/students/${studentId}/documents`);
      return response.data;
    },
    enabled: !!studentId,
  });
};

export const useStudentFees = (studentId?: number) => {
  return useQuery({
    queryKey: ['student-fees', studentId],
    queryFn: async () => {
      // From Finance Module
      const response = await apiClient.get<any[]>(`/finance/student-fees/student/${studentId}`);
      return response.data;
    },
    enabled: !!studentId,
  });
};

