import { apiClient } from './apiClient';
import { API_CONFIG } from '../config/apiConfig';
import { initialStudents } from '../constants/mockData';
import {
  Student,
  CreateStudentDTO,
  UpdateStudentDTO,
  StudentFilter,
} from '../types/studentTypes';
import { APIResponse, PaginatedResponse } from '../types/apiTypes';
import { paginationUtils } from '../utils/paginationUtils';
import { searchUtils } from '../utils/searchUtils';
import { filterUtils } from '../utils/filterUtils';

class StudentService {
  // In-memory collection for standalone client execution
  private mockStudents: Student[] = initialStudents.map((s) => ({
    id: s.id,
    rollNo: s.rollNo,
    name: s.name,
    email: s.email,
    phone: s.phone,
    department: s.department,
    course: 'B.Tech Computer Science',
    semester: s.semester,
    gender: 'Male',
    status: s.status as any,
    admissionYear: 2024,
    feesStatus: s.totalDues > 0 ? 'Pending' : 'Paid',
    cgpa: s.cgpa,
    totalPaid: s.totalPaid,
    totalDues: s.totalDues,
    avatarUrl: s.avatarUrl,
    createdAt: '2024-08-01T10:00:00Z',
    updatedAt: '2026-09-18T14:30:00Z',
  }));

  public async getStudents(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    filter?: StudentFilter;
    sortBy?: keyof Student;
    sortOrder?: 'asc' | 'desc';
  }): Promise<APIResponse<PaginatedResponse<Student>>> {
    if (API_CONFIG.USE_MOCK) {
      await new Promise((res) => setTimeout(res, 250));

      let result = [...this.mockStudents];

      if (params?.search) {
        result = searchUtils.searchObjects(result, params.search, ['name', 'rollNo', 'email', 'department']);
      }

      if (params?.filter) {
        result = filterUtils.filterObjects(result, params.filter as any);
      }

      if (params?.sortBy) {
        result = filterUtils.sortObjects(result, params.sortBy, params.sortOrder || 'asc');
      }

      const paginated = paginationUtils.paginateArray(result, params?.page || 1, params?.pageSize || 10);

      return {
        success: true,
        data: paginated,
        message: 'Student directory records fetched successfully',
        code: 200,
        timestamp: new Date().toISOString(),
      };
    }

    return apiClient.get<PaginatedResponse<Student>>('/students', params);
  }

  public async getStudentById(id: string): Promise<APIResponse<Student>> {
    if (API_CONFIG.USE_MOCK) {
      await new Promise((res) => setTimeout(res, 150));
      const student = this.mockStudents.find((s) => s.id === id || s.rollNo === id);
      if (!student) {
        return {
          success: false,
          data: null as any,
          message: `Student with ID ${id} not found`,
          code: 404,
          timestamp: new Date().toISOString(),
        };
      }
      return {
        success: true,
        data: student,
        message: 'Student profile retrieved',
        code: 200,
        timestamp: new Date().toISOString(),
      };
    }

    return apiClient.get<Student>(`/students/${id}`);
  }

  public async createStudent(data: CreateStudentDTO): Promise<APIResponse<Student>> {
    if (API_CONFIG.USE_MOCK) {
      await new Promise((res) => setTimeout(res, 350));
      const newStudent: Student = {
        id: `st-${Date.now()}`,
        rollNo: data.rollNo,
        name: data.name,
        email: data.email,
        phone: data.phone,
        department: data.department,
        course: data.course,
        semester: data.semester,
        gender: data.gender,
        status: 'Active',
        admissionYear: data.admissionYear,
        feesStatus: 'Paid',
        cgpa: data.cgpa || 8.0,
        totalPaid: 85000,
        totalDues: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.mockStudents.unshift(newStudent);

      return {
        success: true,
        data: newStudent,
        message: `Student ${newStudent.name} (${newStudent.rollNo}) registered successfully`,
        code: 201,
        timestamp: new Date().toISOString(),
      };
    }

    return apiClient.post<Student>('/students', data);
  }

  public async updateStudent(id: string, data: UpdateStudentDTO): Promise<APIResponse<Student>> {
    if (API_CONFIG.USE_MOCK) {
      await new Promise((res) => setTimeout(res, 300));
      const index = this.mockStudents.findIndex((s) => s.id === id || s.rollNo === id);
      if (index === -1) {
        return {
          success: false,
          data: null as any,
          message: 'Student not found',
          code: 404,
          timestamp: new Date().toISOString(),
        };
      }

      this.mockStudents[index] = {
        ...this.mockStudents[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };

      return {
        success: true,
        data: this.mockStudents[index],
        message: 'Student file updated successfully',
        code: 200,
        timestamp: new Date().toISOString(),
      };
    }

    return apiClient.put<Student>(`/students/${id}`, data);
  }

  public async deleteStudent(id: string): Promise<APIResponse<void>> {
    if (API_CONFIG.USE_MOCK) {
      await new Promise((res) => setTimeout(res, 250));
      this.mockStudents = this.mockStudents.filter((s) => s.id !== id && s.rollNo !== id);
      return {
        success: true,
        data: undefined as any,
        message: `Student record ${id} deleted from database`,
        code: 200,
        timestamp: new Date().toISOString(),
      };
    }

    return apiClient.delete<void>(`/students/${id}`);
  }

  public async searchStudents(query: string, fields?: (keyof Student)[]): Promise<APIResponse<Student[]>> {
    if (API_CONFIG.USE_MOCK) {
      await new Promise((res) => setTimeout(res, 150));
      const matches = searchUtils.searchObjects(this.mockStudents, query, fields);
      return {
        success: true,
        data: matches,
        message: `Found ${matches.length} matching students`,
        code: 200,
        timestamp: new Date().toISOString(),
      };
    }

    return apiClient.get<Student[]>('/students/search', { q: query });
  }

  public async filterStudents(filter: StudentFilter): Promise<APIResponse<Student[]>> {
    if (API_CONFIG.USE_MOCK) {
      await new Promise((res) => setTimeout(res, 150));
      const filtered = filterUtils.filterObjects(this.mockStudents, filter as any);
      return {
        success: true,
        data: filtered,
        message: `Filtered ${filtered.length} student records`,
        code: 200,
        timestamp: new Date().toISOString(),
      };
    }

    return apiClient.get<Student[]>('/students/filter', filter as Record<string, any>);
  }

  public async sortStudents(sortBy: keyof Student, order: 'asc' | 'desc' = 'asc'): Promise<APIResponse<Student[]>> {
    if (API_CONFIG.USE_MOCK) {
      await new Promise((res) => setTimeout(res, 100));
      const sorted = filterUtils.sortObjects(this.mockStudents, sortBy, order);
      return {
        success: true,
        data: sorted,
        message: `Sorted student records by ${String(sortBy)} ${order}`,
        code: 200,
        timestamp: new Date().toISOString(),
      };
    }

    return apiClient.get<Student[]>('/students', { sortBy, order });
  }

  public async exportStudents(format: 'csv' | 'json' = 'csv'): Promise<Blob> {
    if (API_CONFIG.USE_MOCK) {
      await new Promise((res) => setTimeout(res, 200));
      if (format === 'json') {
        const jsonContent = JSON.stringify(this.mockStudents, null, 2);
        return new Blob([jsonContent], { type: 'application/json' });
      }
      const headers = 'ID,Roll No,Name,Email,Department,Semester,CGPA,Total Paid,Total Dues,Status\n';
      const rows = this.mockStudents
        .map(
          (s) =>
            `"${s.id}","${s.rollNo}","${s.name}","${s.email}","${s.department}","${s.semester}",${s.cgpa},${s.totalPaid},${s.totalDues},"${s.status}"`
        )
        .join('\n');
      return new Blob([headers + rows], { type: 'text/csv' });
    }

    const response = await apiClient.get<Blob>('/students/export', { format });
    return response.data;
  }
}

export const studentService = new StudentService();
