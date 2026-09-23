import { request } from './apiClient';
import { PageResponse } from '../types/api';
import { Student, StudentFormData, StudentStatus, StudentStatusHistoryItem, StudentStatusUpdatePayload } from '../types/student';

export interface StudentFilterParams {
  page?: number;
  size?: number;
  search?: string;
  status?: StudentStatus | '';
  department?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export const studentService = {
  // Day 02: Student CRUD
  getAll: async (params: StudentFilterParams = {}) => {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.set('page', params.page.toString());
    if (params.size !== undefined) query.set('size', params.size.toString());
    if (params.search) query.set('search', params.search);
    if (params.status) query.set('status', params.status);
    if (params.department) query.set('department', params.department);
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.sortDir) query.set('sortDir', params.sortDir);

    const res = await request<PageResponse<Student>>(`/api/v1/students?${query.toString()}`);
    return res.data;
  },

  getById: async (id: number) => {
    const res = await request<Student>(`/api/v1/students/${id}`);
    return res.data;
  },

  getByRollNumber: async (rollNumber: string) => {
    const res = await request<Student>(`/api/v1/students/roll/${encodeURIComponent(rollNumber)}`);
    return res.data;
  },

  create: async (data: StudentFormData) => {
    const res = await request<Student>('/api/v1/students', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  update: async (id: number, data: StudentFormData) => {
    const res = await request<Student>(`/api/v1/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  delete: async (id: number) => {
    await request<void>(`/api/v1/students/${id}`, {
      method: 'DELETE',
    });
  },

  // Day 05: Student Status
  updateStatus: async (id: number, payload: StudentStatusUpdatePayload) => {
    const res = await request<Student>(`/api/v1/students/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  getStatusHistory: async (id: number) => {
    const res = await request<StudentStatusHistoryItem[]>(`/api/v1/students/${id}/status-history`);
    return res.data;
  }
};
