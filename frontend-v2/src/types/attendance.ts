export interface AttendanceRecordRequest {
  studentId: number;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remarks?: string;
}

export interface AttendanceResponse {
  id: number;
  studentId: number;
  studentName: string;
  rollNumber: string;
  courseCode?: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remarks?: string;
  markedBy: string;
  markedAt: string;
}


export interface AttendanceRecordEntry {
  studentId: number;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remarks?: string;
}

export interface BulkAttendanceRequest {
  sectionId: number;
  scheduleId: number;
  date: string; // YYYY-MM-DD
  records: AttendanceRecordEntry[];
}

export interface StudentAttendanceResponse {
  id: number;
  studentId: number;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remarks?: string;
  markedByFacultyId: number;
  recordedAt: string;
}

export interface SectionAttendanceResponse {
  sectionId: number;
  scheduleId: number;
  date: string;
  records: StudentAttendanceResponse[];
}