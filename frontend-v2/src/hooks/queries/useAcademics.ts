import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../config/api';

export interface Program {
  id: number;
  code: string;
  name: string;
  type: string;
  durationYears: number;
  totalSemesters: number;
  isActive: boolean;
}

export interface Course {
  id: number;
  code: string;
  name: string;
  courseType: string;
  credits: number;
  isActive: boolean;
}

export interface Batch {
  id: number;
  code: string;
  admissionYear: number;
  graduationYear: number;
  isActive: boolean;
}

export const usePrograms = () => {
  return useQuery({
    queryKey: ['programs'],
    queryFn: async () => {
      const response = await apiClient.get<Program[]>('/programs');
      return response.data;
    },
  });
};

export const useCourses = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const response = await apiClient.get<Course[]>('/courses');
      return response.data;
    },
  });
};

export const useBatches = () => {
  return useQuery({
    queryKey: ['batches'],
    queryFn: async () => {
      const response = await apiClient.get<Batch[]>('/batches');
      return response.data;
    },
  });
};
