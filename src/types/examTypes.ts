// Institutional ERP Suite — Phase 10 Enterprise Examination & Result System Types

export type ExamType =
  | 'INTERNAL'
  | 'EXTERNAL'
  | 'PRACTICAL'
  | 'VIVA'
  | 'ONLINE'
  | 'OFFLINE'
  | 'OPEN_BOOK';

export type ExamStatus = 'DRAFT' | 'PUBLISHED' | 'COMPLETED' | 'ARCHIVED';

export interface ExamDefinition {
  id: string;
  examId: string; // 'EXM-2026-END-SEM'
  examName: string;
  semester: number;
  department: string;
  programme: string;
  batch: string;
  academicYear: string;
  type: ExamType;
  credits: number;
  durationMinutes: number;
  instructions: string;
  passingMarks: number;
  maxMarks: number;
  negativeMarking: boolean;
  status: ExamStatus;
}

export interface ExamTimetableSlot {
  id: string;
  courseCode: string;
  courseTitle: string;
  examDate: string;
  startTime: string;
  endTime: string;
  assignedRoom: string;
  invigilatorName: string;
  hasCollision: boolean;
}

export interface HallTicket {
  id: string;
  ticketCode: string; // 'HT-2026-CS108'
  studentRollNo: string;
  studentName: string;
  department: string;
  semester: string;
  photoUrl: string;
  qrCodePayload: string;
  subjects: {
    courseCode: string;
    courseTitle: string;
    examDate: string;
    roomNumber: string;
    seatNumber: string;
  }[];
  digitalSignature: string;
  isVerified: boolean;
}

export interface SeatingPlanItem {
  id: string;
  roomNumber: string;
  seatNumber: string;
  studentRollNo: string;
  studentName: string;
  courseCode: string;
  department: string;
  isSpecialNeeds: boolean;
}

export type BloomTaxonomyLevel = 'REMEMBER' | 'UNDERSTAND' | 'APPLY' | 'ANALYZE' | 'EVALUATE' | 'CREATE';
export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface QuestionBankItem {
  id: string;
  questionCode: string; // 'Q-CS501-041'
  subjectCode: string;
  unitNumber: number;
  difficulty: QuestionDifficulty;
  bloomLevel: BloomTaxonomyLevel;
  questionText: string;
  maxMarks: number;
  versionGroup: 'A' | 'B' | 'C';
}

export interface InvigilatorDuty {
  id: string;
  dutyCode: string;
  facultyId: string;
  facultyName: string;
  department: string;
  roomNumber: string;
  dutyDate: string;
  shiftTime: string;
  status: 'ASSIGNED' | 'SWAPPED' | 'PRESENT' | 'ABSENT';
}

export interface StudentMarksRecord {
  id: string;
  studentRollNo: string;
  studentName: string;
  department: string;
  courseCode: string;
  internalMarks: number;
  externalMarks: number;
  practicalMarks: number;
  vivaMarks: number;
  totalMarks: number;
  gradeLetter: 'O' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'P' | 'F';
  gradePoint: number;
  cgpa: number;
  resultStatus: 'PASSED' | 'BACKLOG' | 'MALPRACTICE';
}

export interface RevaluationRequest {
  id: string;
  requestCode: string; // 'REV-2026-041'
  studentRollNo: string;
  studentName: string;
  courseCode: string;
  currentMarks: number;
  revisedMarks?: number;
  status: 'SUBMITTED' | 'UNDER_EVALUATION' | 'APPROVED' | 'REJECTED';
  appliedDate: string;
}

export interface ExamKPIs {
  upcomingExamsCount: number;
  todayExamsCount: number;
  completedExamsCount: number;
  publishedResultsCount: number;
  revaluationRequestsCount: number;
  studentsAppearingCount: number;
  absentStudentsCount: number;
  malpracticeCasesCount: number;
  classAverageCGPA: number;
  passPercentage: number;
}
