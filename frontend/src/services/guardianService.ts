import { request } from './apiClient';
import { Guardian, GuardianFormData } from '../types/guardian';

export const guardianService = {
  // Day 03: Guardian Management
  getAll: async () => {
    const res = await request<Guardian[]>('/guardians');
    return res.data;
  },

  getById: async (id: number) => {
    const res = await request<Guardian>(`/guardians/${id}`);
    return res.data;
  },

  create: async (data: GuardianFormData) => {
    const res = await request<Guardian>('/guardians', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  update: async (id: number, data: GuardianFormData) => {
    const res = await request<Guardian>(`/guardians/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  delete: async (id: number) => {
    await request<void>(`/guardians/${id}`, {
      method: 'DELETE',
    });
  },

  getByStudentId: async (studentId: number) => {
    const res = await request<Guardian[]>(`/api/v1/students/${studentId}/guardians`);
    return res.data;
  },

  addToStudent: async (studentId: number, data: GuardianFormData) => {
    const res = await request<Guardian>(`/api/v1/students/${studentId}/guardians`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  linkToStudent: async (studentId: number, guardianId: number) => {
    const res = await request<Guardian>(`/api/v1/students/${studentId}/guardians/${guardianId}/link`, {
      method: 'POST',
    });
    return res.data;
  }
};
