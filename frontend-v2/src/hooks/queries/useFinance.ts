import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../config/api';

export interface FeeStructureComponent {
  id: number;
  feeHeadId?: number;
  feeHeadCode?: string;
  feeHeadName?: string;
  amount: number | string;
}

export interface FeeStructure {
  id: number;
  code: string;
  name: string;
  academicYearId?: number;
  programId?: number;
  active: boolean;
  components?: FeeStructureComponent[];
}

export interface StudentFeeComponent {
  id: number;
  feeHeadId?: number;
  feeHeadCode?: string;
  feeHeadName?: string;
  grossAmount: number | string;
  paidAmount: number | string;
  outstandingAmount: number | string;
}

export type StudentFeeStatus = 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'WAIVED' | string;

export interface StudentFee {
  id: number;
  studentId: number;
  academicYearId: number;
  feeStructureId: number;
  grossAmount: number | string;
  scholarshipAmount: number | string;
  concessionAmount: number | string;
  netPayable: number | string;
  paidAmount: number | string;
  outstandingAmount: number | string;
  status: StudentFeeStatus;
  components?: StudentFeeComponent[];
  createdAt?: string;
  updatedAt?: string;
}

export interface FinanceSummary {
  totalGrossAssigned: number | string;
  totalCollected: number | string;
  totalOutstanding: number | string;
}

export interface PaymentRequest {
  amount: number | string;
  paymentDate?: string;
  paymentMethod: 'CASH' | 'CHEQUE' | 'BANK_TRANSFER' | 'ONLINE' | 'UPI' | 'DD' | string;
  referenceNumber?: string;
  remarks?: string;
  idempotencyKey?: string;
}

export interface Receipt {
  id: number;
  receiptNumber: string;
  paymentId?: number;
  referenceNumber?: string;
  studentId: number;
  amount: number | string;
  paymentDate?: string;
  paymentMethod?: string;
  status: string;
  generatedAt?: string;
}

export interface AssignFeeParams {
  studentId: number;
  feeStructureId: number;
  academicYearId: number;
}

/**
 * Safely parses any number or string representation of a monetary value.
 */
export function parseAmount(val: number | string | null | undefined): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const parsed = parseFloat(val);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Formats monetary amounts consistently with Indian Rupee formatting.
 */
export function formatCurrency(val: number | string | null | undefined): string {
  const num = parseAmount(val);
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Queries institutional financial summary (Admin/Finance only).
 */
export const useFinanceSummary = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['finance-summary'],
    queryFn: async () => {
      const response = await apiClient.get<FinanceSummary>('/api/v1/finance/reports/summary');
      return response.data;
    },
    enabled: options?.enabled ?? true,
  });
};

/**
 * Queries all student fee records across the institution (Admin/Finance only).
 */
export const useAllStudentFees = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['student-fees-all'],
    queryFn: async () => {
      const response = await apiClient.get<StudentFee[]>('/api/v1/finance/student-fees');
      return response.data;
    },
    enabled: options?.enabled ?? true,
  });
};

/**
 * Queries fee records assigned to a specific student.
 * Backend verifies authorization via SecurityOwnershipService (Admin/Finance or self-student access).
 */
export const useStudentFees = (studentId?: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['student-fees', studentId],
    queryFn: async () => {
      const response = await apiClient.get<StudentFee[]>(`/api/v1/finance/student-fees/student/${studentId}`);
      return response.data;
    },
    enabled: (options?.enabled ?? true) && !!studentId,
  });
};

/**
 * Queries all defined fee structures.
 */
export const useFeeStructures = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['fee-structures'],
    queryFn: async () => {
      const response = await apiClient.get<FeeStructure[]>('/api/v1/finance/fee-structures');
      return response.data;
    },
    enabled: options?.enabled ?? true,
  });
};

/**
 * Mutation to assign a fee structure to a student for a specific academic year.
 * Target route: POST /api/v1/finance/student-fees/assign?studentId=...&feeStructureId=...&academicYearId=...
 */
export const useAssignFeeStructure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ studentId, feeStructureId, academicYearId }: AssignFeeParams) => {
      const response = await apiClient.post<StudentFee>(
        '/api/v1/finance/student-fees/assign',
        null,
        {
          params: {
            studentId,
            feeStructureId,
            academicYearId,
          },
        }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student-fees', variables.studentId] });
      queryClient.invalidateQueries({ queryKey: ['student-fees-all'] });
      queryClient.invalidateQueries({ queryKey: ['finance-summary'] });
    },
  });
};

/**
 * Mutation to record a payment against a student fee record.
 * Target route: POST /api/v1/finance/payments/student-fee/{studentFeeId}
 */
export const useRecordPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ studentFeeId, payment }: { studentFeeId: number; payment: PaymentRequest }) => {
      const headers: Record<string, string> = {};
      if (payment.idempotencyKey) {
        headers['Idempotency-Key'] = payment.idempotencyKey;
      }
      const response = await apiClient.post<Receipt>(
        `/api/v1/finance/payments/student-fee/${studentFeeId}`,
        payment,
        { headers }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-fees'] });
      queryClient.invalidateQueries({ queryKey: ['student-fees-all'] });
      queryClient.invalidateQueries({ queryKey: ['finance-summary'] });
    },
  });
};

export interface FeeHead {
  id: number;
  code: string;
  name: string;
  description?: string;
  type?: string;
  isActive?: boolean;
}

export const useFeeHeads = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['fee-heads'],
    queryFn: async () => {
      const response = await apiClient.get<FeeHead[]>('/api/v1/finance/fee-heads');
      return response.data;
    },
    enabled: options?.enabled ?? true,
  });
};

export const useCreateFeeHead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (head: { name: string; code?: string; description?: string }) => {
      const response = await apiClient.post<FeeHead>('/api/v1/finance/fee-heads', head);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-heads'] });
    },
  });
};

export const useCreateFeeStructure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; code: string; academicYearId?: number; programId?: number }) => {
      const response = await apiClient.post<FeeStructure>('/api/v1/finance/fee-structures', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-structures'] });
    },
  });
};

export const useApproveFeeStructure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.patch<FeeStructure>(`/api/v1/finance/fee-structures/${id}/approve`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-structures'] });
    },
  });
};

export const useAddComponentToFeeStructure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ structureId, headId, amount }: { structureId: number; headId: number; amount: number }) => {
      const response = await apiClient.post<FeeStructure>(
        `/api/v1/finance/fee-structures/${structureId}/components?headId=${headId}&amount=${amount}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-structures'] });
    },
  });
};
