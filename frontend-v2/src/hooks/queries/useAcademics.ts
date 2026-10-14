import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  name?: string;
  programId?: number;
  admissionYear: number;
  graduationYear: number;
  isActive: boolean;
}

export interface AcademicYear {
  id: number;
  name: string;
  code?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface Semester {
  id: number;
  name: string;
  semesterNumber: number;
  academicYearId: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface CourseOffering {
  id: number;
  course: Course;
  semester: Semester;
  maxCapacity: number;
  isPublished: boolean;
}

export const usePrograms = () => {
  return useQuery({
    queryKey: ['programs'],
    queryFn: async () => {
      const response = await apiClient.get<Program[]>('/api/v1/programs');
      return response.data;
    },
  });
};

export const useCourses = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const response = await apiClient.get<Course[]>('/api/v1/courses');
      return response.data;
    },
  });
};

export const useBatches = () => {
  return useQuery({
    queryKey: ['batches'],
    queryFn: async () => {
      const response = await apiClient.get<Batch[]>('/api/v1/batches');
      return response.data;
    },
  });
};

export const useAcademicYears = () => {
  return useQuery({
    queryKey: ['academic-years'],
    queryFn: async () => {
      const response = await apiClient.get<AcademicYear[]>('/api/v1/academic-years');
      return response.data;
    },
  });
};

export const useSemesters = () => {
  return useQuery({
    queryKey: ['semesters'],
    queryFn: async () => {
      const response = await apiClient.get<Semester[]>('/api/v1/semesters');
      return response.data;
    },
  });
};

export const useCreateSemester = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Semester, 'id'>) => {
      const response = await apiClient.post<Semester>('/api/v1/semesters', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['semesters'] });
    },
  });
};

export const useCourseOfferings = () => {
  return useQuery({
    queryKey: ['course-offerings'],
    queryFn: async () => {
      const response = await apiClient.get<CourseOffering[]>('/api/v1/course-offerings');
      return response.data;
    },
  });
};

export const useCreateCourseOffering = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { courseId: number; semesterId: number; maxCapacity: number }) => {
      const response = await apiClient.post<CourseOffering>('/api/v1/course-offerings', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-offerings'] });
    },
  });
};

export interface Section {
  id: number;
  name: string;
  courseOfferingId: number;
  capacity: number;
  currentEnrollment: number;
  isActive: boolean;
}

export const useSections = () => {
  return useQuery({
    queryKey: ['sections'],
    queryFn: async () => {
      const response = await apiClient.get<Section[]>('/api/v1/sections');
      return response.data;
    },
  });
};

export const useCreateSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; courseOfferingId: number; capacity: number }) => {
      const response = await apiClient.post<Section>('/api/v1/sections', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
    },
  });
};

export interface AppUser {
  id: number;
  username: string;
  email: string;
  role: string;
  enabled: boolean;
}

export interface FacultySummary {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
}

export const useFacultyList = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['admin-faculty'],
    queryFn: async () => {
      const response = await apiClient.get<FacultySummary[]>('/api/v1/admin/faculty');
      return response.data;
    },
    enabled: options?.enabled !== undefined ? options.enabled : true,
  });
};

export interface SectionFacultyResponse {
  id: number;
  sectionId: number;
  facultyId: number;
  subjectId?: number;
  subjectName?: string;
  role: string;
}

export const useSectionFaculty = (sectionId: number) => {
  return useQuery({
    queryKey: ['sections', sectionId, 'faculty'],
    queryFn: async () => {
      const response = await apiClient.get<SectionFacultyResponse[]>(`/api/v1/sections/${sectionId}/faculty`);
      return response.data;
    },
    enabled: !!sectionId,
  });
};

export const useAssignFaculty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sectionId, facultyId, role, subjectId }: { sectionId: number; facultyId: number; role: string; subjectId?: number }) => {
      const response = await apiClient.post<SectionFacultyResponse>(`/api/v1/sections/${sectionId}/faculty`, {
        facultyId, role, subjectId
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sections', variables.sectionId, 'faculty'] });
    },
  });
};

export interface TimetableSlot {
  id?: number;
  sectionId: number;
  facultyId: number;
  roomId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isActive?: boolean;
}

export interface Room {
  id: number;
  name: string;
  capacity: number;
  isActive: boolean;
  timetableSlotCount?: number;
}

export const useRooms = (includeInactive: boolean = true) => {
  return useQuery({
    queryKey: ['rooms', includeInactive],
    queryFn: async () => {
      const response = await apiClient.get<Room[]>(`/api/v1/rooms?includeInactive=${includeInactive}`);
      return response.data;
    },
  });
};

export const useCreateRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; capacity: number; isActive?: boolean }) => {
      const response = await apiClient.post<Room>('/api/v1/rooms', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
};

export const useUpdateRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { name: string; capacity: number; isActive?: boolean } }) => {
      const response = await apiClient.put<Room>(`/api/v1/rooms/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
};

export const useDeactivateRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.patch<Room>(`/api/v1/rooms/${id}/deactivate`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
};

export const useActivateRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.patch<Room>(`/api/v1/rooms/${id}/activate`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
};

export const useDeleteRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/api/v1/rooms/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
};

export const useTimetable = (sectionId: number) => {
  return useQuery({
    queryKey: ['timetable', sectionId],
    queryFn: async () => {
      const response = await apiClient.get<TimetableSlot[]>(`/api/v1/timetable/section/${sectionId}`);
      return response.data;
    },
    enabled: !!sectionId,
  });
};

export const useAllocateSlot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: TimetableSlot) => {
      const response = await apiClient.post<TimetableSlot>('/api/v1/timetable/allocate', data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['timetable', variables.sectionId] });
    },
  });
};

export interface Department {
  id: number;
  name: string;
  code: string;
  campusId?: number;
}

export const useDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await apiClient.get<Department[]>('/api/v1/departments');
      return response.data;
    },
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; code: string; campusId?: number }) => {
      const response = await apiClient.post<Department>('/api/v1/departments', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
};

export const useCreateAcademicYear = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; startDate: string; endDate: string; isActive?: boolean }) => {
      const response = await apiClient.post<AcademicYear>('/api/v1/academic-years', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
    },
  });
};

export const useCreateProgram = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { code: string; name: string; degree: string; departmentId: number; duration: number; isActive?: boolean }) => {
      const response = await apiClient.post<Program>('/api/v1/programs', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
    },
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { code: string; name: string; courseType: string; credits: number; departmentId: number; programId?: number; isActive?: boolean }) => {
      const response = await apiClient.post<Course>('/api/v1/courses', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};

export const useCreateBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; code: string; programId: number; admissionYear: number; graduationYear: number; academicYearId?: number; isActive?: boolean }) => {
      const response = await apiClient.post<Batch>('/api/v1/batches', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
    },
  });
};

export interface CoursePrerequisiteItem {
  id: number;
  courseId: number;
  courseCode: string;
  courseName: string;
  prerequisiteCourseId: number;
  prerequisiteCourseCode: string;
  prerequisiteCourseName: string;
}

export const useCoursePrerequisites = (courseId: number | null) => {
  return useQuery({
    queryKey: ['courses', courseId, 'prerequisites'],
    queryFn: async () => {
      if (!courseId) return [];
      const response = await apiClient.get<CoursePrerequisiteItem[]>(`/api/v1/courses/${courseId}/prerequisites`);
      return response.data;
    },
    enabled: !!courseId,
  });
};

export const useAddCoursePrerequisite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ courseId, prerequisiteCourseId }: { courseId: number; prerequisiteCourseId: number }) => {
      const response = await apiClient.post<CoursePrerequisiteItem>(`/api/v1/courses/${courseId}/prerequisites/${prerequisiteCourseId}`);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courses', variables.courseId, 'prerequisites'] });
    },
  });
};

export const useRemoveCoursePrerequisite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ courseId, prerequisiteCourseId }: { courseId: number; prerequisiteCourseId: number }) => {
      await apiClient.delete(`/api/v1/courses/${courseId}/prerequisites/${prerequisiteCourseId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courses', variables.courseId, 'prerequisites'] });
    },
  });
};

