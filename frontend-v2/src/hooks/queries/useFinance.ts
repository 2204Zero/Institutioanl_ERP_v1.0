import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../config/api';

export interface FeeStructure {
  id: number;
  code: string;
  name: string;
  academicYearId: number;
  programId: number;
  active: boolean;
}

export interface StudentFee {
  id: number;
  studentId: number;
  academicYearId: number;
  feeStructureId: number;
  grossAmount: number;
  scholarshipAmount: number;
  concessionAmount: number;
  netPayable: number;
  paidAmount: number;
  outstandingAmount: number;
  status: string;
}

export interface FinanceSummary {
  totalGrossAssigned: number;
  totalCollected: number;
  totalOutstanding: number;
}

export const useFinanceSummary = () => {
  return useQuery({
    queryKey: ['finance-summary'],
    queryFn: async () => {
      const response = await apiClient.get<FinanceSummary>('/finance/reports/summary');
      return response.data;
    },
  });
};

export const useAllStudentFees = () => {
  return useQuery({
    queryKey: ['student-fees-all'],
    queryFn: async () => {
      const response = await apiClient.get<StudentFee[]>('/finance/student-fees');
      return response.data;
    },
  });
};

export const useStudentFees = (studentId?: number) => {
  return useQuery({
    queryKey: ['student-fees', studentId],
    queryFn: async () => {
      const response = await apiClient.get<StudentFee[]>(`/finance/student-fees/student/${studentId}`);
      return response.data;
    },
    enabled: !!studentId,
  });
};

