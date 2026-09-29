/**
 * Enterprise Academic Management & Learning Management System (LMS) Types
 */

export type MaterialType = 'PDF' | 'Video' | 'LectureNotes' | 'Slides' | 'Assignment' | 'Quiz';

export interface LearningMaterial {
  id: string;
  courseCode: string;
  courseName: string;
  title: string;
  type: MaterialType;
  uploadedBy: string;
  uploadedAt: string;
  fileSize: string;
  url: string;
  downloadsCount: number;
}

export interface DiscussionThread {
  id: string;
  courseCode: string;
  title: string;
  authorName: string;
  authorRole: 'Faculty' | 'Student';
  createdAt: string;
  repliesCount: number;
  lastActivityAt: string;
  content: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
}

export interface Quiz {
  id: string;
  courseCode: string;
  title: string;
  totalQuestions: number;
  durationMinutes: number;
  passingScore: number;
  dueDate: string;
  questions: QuizQuestion[];
}

export interface ClassroomBooking {
  id: string;
  roomNo: string;
  facilityType: 'Lecture Hall' | 'Computer Lab' | 'Seminar Hall' | 'Research Lab';
  capacity: number;
  bookedBy: string;
  purpose: string;
  startTime: string;
  endTime: string;
  status: 'Approved' | 'Pending' | 'Rejected';
}

export interface FacultyWorkload {
  employeeId: string;
  facultyName: string;
  department: string;
  assignedCourses: string[];
  weeklyHours: number;
  maxCredits: number;
  currentCredits: number;
}
