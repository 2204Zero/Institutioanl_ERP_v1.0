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