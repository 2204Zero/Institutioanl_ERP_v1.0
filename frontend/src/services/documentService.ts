import { request } from './apiClient';
import { DocumentType, StudentDocument } from '../types/document';

export const documentService = {
  // Day 04: Document Management
  upload: async (studentId: number, documentType: DocumentType, file: File) => {
    const formData = new FormData();
    formData.append('documentType', documentType);
    formData.append('file', file);

    const res = await request<StudentDocument>(`/api/v1/students/${studentId}/documents`, {
      method: 'POST',
      body: formData,
    });
    return res.data;
  },

  getByStudentId: async (studentId: number) => {
    const res = await request<StudentDocument[]>(`/api/v1/students/${studentId}/documents`);
    return res.data;
  },

  getMetadata: async (documentId: number) => {
    const res = await request<StudentDocument>(`/api/v1/documents/${documentId}/metadata`);
    return res.data;
  },

  delete: async (documentId: number) => {
    await request<void>(`/api/v1/documents/${documentId}`, {
      method: 'DELETE',
    });
  },

  getDownloadUrl: (documentId: number) => `/api/v1/documents/${documentId}/download`,
  getViewUrl: (documentId: number) => `/api/v1/documents/${documentId}/view`
};
