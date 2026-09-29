// Institutional ERP Suite — Phase 10 Enterprise Examination & Result Service Engine

import {
  ExamDefinition,
  ExamTimetableSlot,
  HallTicket,
  SeatingPlanItem,
  QuestionBankItem,
  InvigilatorDuty,
  StudentMarksRecord,
  RevaluationRequest,
  ExamKPIs,
} from '../types/examTypes';

/**
 * Spring Boot terminal audit logger for Exam & Result events.
 */
export function logExamAction(event: {
  user: string;
  role: string;
  action: string;
  exam?: string;
  student?: string;
  department?: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'REJECTED';
  durationMs?: number;
  details?: string;
}): void {
  const duration = event.durationMs || Math.floor(18 + Math.random() * 40);
  const formattedLog = `[EXAM]\nUser : ${event.user}\nRole : ${event.role}\nAction : ${event.action}${
    event.exam ? `\nExam : ${event.exam}` : ''
  }${event.student ? `\nStudent : ${event.student}` : ''}${
    event.department ? `\nDepartment : ${event.department}` : ''
  }\nStatus : ${event.status}\nDuration : ${duration}ms${
    event.details ? `\nDetails : ${event.details}` : ''
  }`;

  console.log(`%c${formattedLog}`, 'color: #dc2626; font-weight: bold;');
}

const mockExams: ExamDefinition[] = [
  {
    id: 'ex-1',
    examId: 'EXM-2026-END-SEM',
    examName: 'Semester V Autumn End-Semester Theory & Lab Examinations',
    semester: 5,
    department: 'Computer Science',
    programme: 'B.Tech',
    batch: '2024-2028',
    academicYear: '2026-2027',
    type: 'EXTERNAL',
    credits: 24,
    durationMinutes: 180,
    instructions: 'No electronic gadgets permitted. Bring university issued ID and Hall Ticket.',
    passingMarks: 40,
    maxMarks: 100,
    negativeMarking: false,
    status: 'PUBLISHED',
  },
];

const mockSlots: ExamTimetableSlot[] = [
  {
    id: 'slot-1',
    courseCode: 'CS-501',
    courseTitle: 'Database Management Systems',
    examDate: '2026-11-10',
    startTime: '09:30 AM',
    endTime: '12:30 PM',
    assignedRoom: 'Ramanujan Hall A-201',
    invigilatorName: 'Prof. Ramesh Kumar',
    hasCollision: false,
  },
  {
    id: 'slot-2',
    courseCode: 'CS-502',
    courseTitle: 'Operating Systems & System Architecture',
    examDate: '2026-11-12',
    startTime: '09:30 AM',
    endTime: '12:30 PM',
    assignedRoom: 'Ramanujan Hall A-202',
    invigilatorName: 'Dr. Alok Verma',
    hasCollision: false,
  },
];

const mockHallTicket: HallTicket = {
  id: 'ht-1',
  ticketCode: 'HT-2026-CS108',
  studentRollNo: '2024CS108',
  studentName: 'Aarav Sharma',
  department: 'Computer Science',
  semester: 'Semester 5',
  photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  qrCodePayload: 'hallticket://verify/HT-2026-CS108/2024CS108',
  subjects: [
    { courseCode: 'CS-501', courseTitle: 'Database Management Systems', examDate: '2026-11-10 09:30 AM', roomNumber: 'A-201', seatNumber: 'A-12' },
    { courseCode: 'CS-502', courseTitle: 'Operating Systems', examDate: '2026-11-12 09:30 AM', roomNumber: 'A-202', seatNumber: 'B-04' },
  ],
  digitalSignature: 'SIG_SHA256_COE_901827364',
  isVerified: true,
};

const mockSeating: SeatingPlanItem[] = [
  { id: 'seat-1', roomNumber: 'A-201', seatNumber: 'A-12', studentRollNo: '2024CS108', studentName: 'Aarav Sharma', courseCode: 'CS-501', department: 'Computer Science', isSpecialNeeds: false },
];

const mockQuestions: QuestionBankItem[] = [
  {
    id: 'q-1',
    questionCode: 'Q-CS501-041',
    subjectCode: 'CS-501',
    unitNumber: 3,
    difficulty: 'HARD',
    bloomLevel: 'ANALYZE',
    questionText: 'Explain B+ Tree node splitting during insertion when order m = 4. Provide time complexity analysis.',
    maxMarks: 10,
    versionGroup: 'A',
  },
];

const mockInvigilators: InvigilatorDuty[] = [
  {
    id: 'inv-1',
    dutyCode: 'DUTY-2026-081',
    facultyId: 'FAC-8015',
    facultyName: 'Prof. Ramesh Kumar',
    department: 'Electronics',
    roomNumber: 'A-201',
    dutyDate: '2026-11-10',
    shiftTime: '09:30 AM - 12:30 PM',
    status: 'ASSIGNED',
  },
];

const mockMarks: StudentMarksRecord[] = [
  { id: 'm-1', studentRollNo: '2024CS108', studentName: 'Aarav Sharma', department: 'Computer Science', courseCode: 'CS-501', internalMarks: 28, externalMarks: 64, practicalMarks: 0, vivaMarks: 0, totalMarks: 92, gradeLetter: 'A+', gradePoint: 9, cgpa: 8.9, resultStatus: 'PASSED' },
  { id: 'm-2', studentRollNo: '2024EC210', studentName: 'Ananya Verma', department: 'Electronics', courseCode: 'EC-501', internalMarks: 29, externalMarks: 67, practicalMarks: 0, vivaMarks: 0, totalMarks: 96, gradeLetter: 'O', gradePoint: 10, cgpa: 9.2, resultStatus: 'PASSED' },
];

const mockRevaluation: RevaluationRequest[] = [
  {
    id: 'rev-1',
    requestCode: 'REV-2026-041',
    studentRollNo: '2024CE019',
    studentName: 'Vikram Singh',
    courseCode: 'CE-501',
    currentMarks: 42,
    revisedMarks: 48,
    status: 'APPROVED',
    appliedDate: '2026-09-20',
  },
];

export class ExamService {
  public static getKPIs(): ExamKPIs {
    return {
      upcomingExamsCount: 12,
      todayExamsCount: 2,
      completedExamsCount: 48,
      publishedResultsCount: 4,
      revaluationRequestsCount: 8,
      studentsAppearingCount: 4850,
      absentStudentsCount: 14,
      malpracticeCasesCount: 0,
      classAverageCGPA: 8.24,
      passPercentage: 96.4,
    };
  }

  public static getExams(): ExamDefinition[] { return mockExams; }
  public static getTimetableSlots(): ExamTimetableSlot[] { return mockSlots; }
  public static getHallTicket(rollNo: string): HallTicket { return mockHallTicket; }
  public static getSeatingPlan(): SeatingPlanItem[] { return mockSeating; }
  public static getQuestionBank(): QuestionBankItem[] { return mockQuestions; }
  public static getInvigilatorDuties(): InvigilatorDuty[] { return mockInvigilators; }
  public static getStudentMarks(): StudentMarksRecord[] { return mockMarks; }
  public static getRevaluationRequests(): RevaluationRequest[] { return mockRevaluation; }

  public static publishSemesterResults(examName: string): void {
    logExamAction({
      user: 'Controller of Examination',
      role: 'Controller of Examination',
      action: 'Result Published',
      exam: examName,
      department: 'All Departments',
      status: 'SUCCESS',
      durationMs: 42,
      details: 'Published cryptographically signed transcripts to 4,850 student portals.',
    });
  }

  public static generateHallTicketPDF(rollNo: string): void {
    logExamAction({
      user: 'Student / Exam Cell',
      role: 'Student',
      action: 'Hall Ticket Generated',
      student: rollNo,
      status: 'SUCCESS',
      durationMs: 18,
      details: `Generated digitally signed PDF for ${rollNo}`,
    });
  }
}
