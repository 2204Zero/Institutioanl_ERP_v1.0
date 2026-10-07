import { useQuery } from '@tanstack/react-query';
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

export const useApplicants = () => {
  return useQuery({
    queryKey: ['applicants'],
    queryFn: async () => {
      const response = await apiClient.get<Applicant[]>('/applicants');
      return response.data;
    },
  });
};

export const useApplications = () => {
  return useQuery({
    queryKey: ['admission-applications'],
    queryFn: async () => {
      const response = await apiClient.get<AdmissionApplication[]>('/admission-applications');
      return response.data;
    },
  });
};
