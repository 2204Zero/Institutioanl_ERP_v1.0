import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../config/api';

export interface Applicant {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  inquiryDate: string;
}

export interface AdmissionApplication {
  id: number;
  applicantId: number;
  programId: number;
  academicYearId: number;
  status: string;
  applicationDate: string;
  remarks?: string;
}

export interface ApplicantDocument {
  id: number;
  documentType: string;
  fileUrl: string;
  verificationStatus: string;
  remarks?: string;
}

export const useApplicants = () => {
  return useQuery({
    queryKey: ['applicants'],
    queryFn: async () => {
      const response = await apiClient.get<Applicant[]>('/api/v1/applicants');
      return response.data;
    },
  });
};

export const useApplications = () => {
  return useQuery({
    queryKey: ['admission-applications'],
    queryFn: async () => {
      const response = await apiClient.get<AdmissionApplication[]>('/api/v1/admission-applications');
      return response.data;
    },
  });
};

export const useApplicantDocuments = (applicantId: number | null) => {
  return useQuery({
    queryKey: ['applicant-documents', applicantId],
    queryFn: async () => {
      if (!applicantId) return [];
      const response = await apiClient.get<ApplicantDocument[]>(`/api/v1/applicant-documents/applicant/${applicantId}`);
      return response.data;
    },
    enabled: !!applicantId,
  });
};

export const useVerifyDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, remarks }: { id: number; status: string; remarks?: string }) => {
      const response = await apiClient.patch(`/api/v1/applicant-documents/${id}/verify?status=${status}${remarks ? `&remarks=${encodeURIComponent(remarks)}` : ''}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applicant-documents'] });
    }
  });
};

export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, targetStatus }: { id: number; targetStatus: string }) => {
      const response = await apiClient.patch(`/api/v1/admission-workflows/applications/${id}/process?targetStatus=${targetStatus}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admission-applications'] });
    }
  });
};

export const useOnboardStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.post(`/api/v1/admission-workflows/applications/${id}/onboard`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admission-applications'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
    }
  });
};

export const useCreateInquiry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { firstName: string; lastName: string; email: string; phone: string; programId?: number; academicYearId?: number; remarks?: string }) => {
      const response = await apiClient.post('/api/v1/admissions/public/applications', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applicants'] });
      queryClient.invalidateQueries({ queryKey: ['admission-applications'] });
    }
  });
};
