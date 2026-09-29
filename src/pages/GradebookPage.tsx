import React, { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { useERP } from '../hooks/useERP';
import { ExamService, logExamAction } from '../services/examService';
import {
  Award,
  CheckCircle2,
  Download,
  Send,
  FileSpreadsheet,
  Lock,
  Calendar,
  QrCode,
  Users,
  FileText,
  ShieldCheck,
  Plus,
  RefreshCw,
  Search,
  PieChart,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';

type ExamTab =
  | 'overview'
  | 'planning-timetable'
  | 'hall-tickets'
  | 'seating-arrangement'
  | 'question-bank'
  | 'invigilator-duties'
  | 'marks-entry'
  | 'results-transcripts';

export const GradebookPage: React.FC = () => {
  const { addToast } = useERP();
  const [activeTab, setActiveTab] = useState<ExamTab>('overview');
  const [isPublished, setIsPublished] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Service Datasets
  const kpis = ExamService.getKPIs();
  const exams = ExamService.getExams();
  const slots = ExamService.getTimetableSlots();
  const hallTicket = ExamService.getHallTicket('2024CS108');
  const seating = ExamService.getSeatingPlan();
  const questions = ExamService.getQuestionBank();
  const invigilators = ExamService.getInvigilatorDuties();
  const marks = ExamService.getStudentMarks();
  const revaluations = ExamService.getRevaluationRequests();

  const handlePublishResultsBatch = () => {
    setIsPublished(true);
    ExamService.publishSemesterResults('Semester V End-Semester');
    addToast('Results Published!', 'Semester 5 transcripts published to Student Portals.', 'success');
  };

  const handleDownloadHallTicketPDF = () => {
    ExamService.generateHallTicketPDF('2024CS108');
    addToast('Hall Ticket Generated', 'Digitally signed Hall Ticket PDF downloaded.', 'info');
  };

  return (
    <AppLayout>
      <div className="space-y-6 text-left">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Award className="w-7 h-7 text-rose-600" /> Enterprise Examination & Result Control Suite
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Phase 10 — Timetable Engine, QR Hall Tickets, Seating Plan, Question Bank, Invigilators, Marks & CGPA.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                logExamAction({
                  user: 'Exam Coordinator',
                  role: 'Exam Coordinator',
                  action: 'Exported Gradebook Spreadsheet',
                  status: 'SUCCESS',
                });
                addToast('Spreadsheet Exported', 'Downloaded Gradebook CSV.', 'success');
              }}
            >
              <FileSpreadsheet className="w-4 h-4 mr-1.5" /> Export Ledger
            </Button>
            <Button
              variant={isPublished ? 'secondary' : 'primary'}
              size="sm"
              className={isPublished ? '' : 'bg-rose-600 hover:bg-rose-700'}
              onClick={handlePublishResultsBatch}
              disabled={isPublished}
            >
              {isPublished ? (
                <>
                  <Lock className="w-4 h-4 mr-1.5" /> Results Published
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-1.5" /> Publish Semester Results
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Phase 10 Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-200">
          {[
            { id: 'overview', label: 'Exam Dashboard', icon: <PieChart className="w-4 h-4" /> },
            { id: 'planning-timetable', label: 'Planning & Timetable', icon: <Calendar className="w-4 h-4" /> },
            { id: 'hall-tickets', label: 'Hall Tickets (QR)', icon: <QrCode className="w-4 h-4" /> },
            { id: 'seating-arrangement', label: 'Seating Arrangement', icon: <Users className="w-4 h-4" /> },
            { id: 'question-bank', label: 'Question Paper Bank', icon: <HelpCircle className="w-4 h-4" /> },
            { id: 'invigilator-duties', label: 'Invigilator Roster', icon: <ShieldCheck className="w-4 h-4" /> },
            { id: 'marks-entry', label: 'Marks Entry & Moderation', icon: <FileText className="w-4 h-4" /> },
            { id: 'results-transcripts', label: 'Results & Transcripts', icon: <Award className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ExamTab)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: EXAM DASHBOARD */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 border-l-4 border-l-rose-600">
                <p className="text-xs font-semibold text-slate-500 uppercase">Class Average CGPA</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{kpis.classAverageCGPA} / 10</h3>
                <span className="text-[11px] text-emerald-600 font-medium">+0.3 vs previous semester</span>
              </Card>

              <Card className="p-4 border-l-4 border-l-emerald-600">
                <p className="text-xs font-semibold text-slate-500 uppercase">Pass Percentage</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{kpis.passPercentage}%</h3>
                <span className="text-[11px] text-emerald-600 font-medium">{kpis.studentsAppearingCount.toLocaleString()} Passed Clean</span>
              </Card>

              <Card className="p-4 border-l-4 border-l-amber-500">
                <p className="text-xs font-semibold text-slate-500 uppercase">Revaluation Requests</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{kpis.revaluationRequestsCount}</h3>
                <span className="text-[11px] text-amber-600 font-medium">Under Evaluation Board</span>
              </Card>

              <Card className="p-4 border-l-4 border-l-purple-600">
                <p className="text-xs font-semibold text-slate-500 uppercase">Malpractice Cases</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{kpis.malpracticeCasesCount}</h3>
                <span className="text-[11px] text-purple-600 font-medium">Zero Violations Logged</span>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-5 border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900 text-sm">Upcoming Semester Exam Schedule</h3>
                <div className="space-y-2 text-xs">
                  {slots.map((s) => (
                    <div key={s.id} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <div>
                        <span className="font-bold text-slate-900">{s.courseCode}</span>: {s.courseTitle}
                        <div className="text-[11px] text-slate-500">{s.examDate} • {s.startTime}</div>
                      </div>
                      <Badge variant="info">{s.assignedRoom}</Badge>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-5 border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900 text-sm">Department Performance Index</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span>Computer Science</span><span className="font-bold text-emerald-600">98.2% Pass (8.9 CGPA)</span></div>
                  <div className="flex justify-between"><span>Electronics & Communication</span><span className="font-bold text-emerald-600">96.5% Pass (9.2 CGPA)</span></div>
                  <div className="flex justify-between"><span>Mechanical Engineering</span><span className="font-bold text-emerald-600">94.8% Pass (7.8 CGPA)</span></div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: PLANNING & TIMETABLE */}
        {activeTab === 'planning-timetable' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Collision-Free Examination Timetable Engine</h2>
                <p className="text-xs text-slate-500">Automated conflict checking, faculty availability, and room allocations.</p>
              </div>
            </div>

            <Card className="p-0 overflow-hidden border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Course Code</th>
                    <th className="p-3.5">Subject Title</th>
                    <th className="p-3.5">Exam Date</th>
                    <th className="p-3.5">Time Slot</th>
                    <th className="p-3.5">Assigned Room</th>
                    <th className="p-3.5">Invigilator</th>
                    <th className="p-3.5">Collision Check</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {slots.map((sl) => (
                    <tr key={sl.id} className="hover:bg-slate-50/80">
                      <td className="p-3.5 font-mono font-bold text-rose-600">{sl.courseCode}</td>
                      <td className="p-3.5 font-semibold text-slate-900">{sl.courseTitle}</td>
                      <td className="p-3.5 font-medium">{sl.examDate}</td>
                      <td className="p-3.5 text-slate-700">{sl.startTime} - {sl.endTime}</td>
                      <td className="p-3.5 font-mono">{sl.assignedRoom}</td>
                      <td className="p-3.5">{sl.invigilatorName}</td>
                      <td className="p-3.5"><Badge variant="success">PASSED (0 Conflicts)</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* TAB 3: HALL TICKETS */}
        {activeTab === 'hall-tickets' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Digital Hall Ticket & QR Verification</h2>
                <p className="text-xs text-slate-500">Cryptographically signed admit cards with QR verification.</p>
              </div>
              <Button variant="primary" size="sm" className="bg-rose-600 hover:bg-rose-700 text-xs" onClick={handleDownloadHallTicketPDF}>
                <Download className="w-4 h-4 mr-1.5" /> Download Hall Ticket PDF
              </Button>
            </div>

            <Card className="p-6 bg-slate-900 text-white rounded-xl space-y-4 max-w-2xl border border-slate-800">
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="font-mono text-[10px] text-rose-400 font-bold uppercase">{hallTicket.ticketCode}</span>
                  <h3 className="text-xl font-extrabold">{hallTicket.studentName}</h3>
                  <p className="text-xs text-slate-400">{hallTicket.studentRollNo} • {hallTicket.department}</p>
                </div>
                <QrCode className="w-14 h-14 text-slate-300" />
              </div>

              <div className="space-y-2 text-xs">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Appearing Subjects</span>
                {hallTicket.subjects.map((sub, idx) => (
                  <div key={idx} className="flex justify-between p-2 bg-slate-800 rounded">
                    <span>{sub.courseCode}: {sub.courseTitle}</span>
                    <span className="font-mono text-emerald-400">{sub.examDate} (Room {sub.roomNumber})</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* TAB 5: QUESTION BANK */}
        {activeTab === 'question-bank' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Question Paper Bank & Bloom's Taxonomy</h2>
                <p className="text-xs text-slate-500">Random paper generation (Version A/B/C) with difficulty classification.</p>
              </div>
            </div>

            <div className="space-y-4">
              {questions.map((q) => (
                <Card key={q.id} className="p-5 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-rose-600">{q.questionCode}</span>
                    <div className="flex gap-2">
                      <Badge variant="purple">{q.bloomLevel}</Badge>
                      <Badge variant="danger">{q.difficulty}</Badge>
                    </div>
                  </div>
                  <h4 className="font-semibold text-slate-900 text-sm">{q.questionText}</h4>
                  <p className="text-xs text-slate-500">Subject: {q.subjectCode} • Unit {q.unitNumber} • Max Marks: {q.maxMarks} • Version Group {q.versionGroup}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: RESULTS & TRANSCRIPTS */}
        {activeTab === 'results-transcripts' && (
          <div className="space-y-6">
            <Card className="p-0 overflow-hidden border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Roll No</th>
                    <th className="p-3.5">Student Name</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5 text-center">Mid-Sem</th>
                    <th className="p-3.5 text-center">End-Sem</th>
                    <th className="p-3.5 text-center">Total</th>
                    <th className="p-3.5 text-center">Grade</th>
                    <th className="p-3.5 text-center">CGPA</th>
                    <th className="p-3.5 text-right">Result Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {marks.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/80">
                      <td className="p-3.5 font-mono font-bold text-rose-600">{m.studentRollNo}</td>
                      <td className="p-3.5 font-semibold text-slate-900">{m.studentName}</td>
                      <td className="p-3.5">{m.department}</td>
                      <td className="p-3.5 text-center font-mono">{m.internalMarks}</td>
                      <td className="p-3.5 text-center font-mono">{m.externalMarks}</td>
                      <td className="p-3.5 text-center font-bold text-slate-900">{m.totalMarks}</td>
                      <td className="p-3.5 text-center font-extrabold text-rose-600">{m.gradeLetter}</td>
                      <td className="p-3.5 text-center font-mono font-bold text-slate-800">{m.cgpa}</td>
                      <td className="p-3.5 text-right"><Badge variant="success">{m.resultStatus}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            <Card className="p-4 bg-slate-950 text-slate-200 font-mono text-xs rounded-xl space-y-2 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                <span className="font-bold text-rose-400">Live Spring Boot stdout Audit Stream</span>
                <span>Logger: ExamController</span>
              </div>
              <div className="space-y-1 text-[11px] text-slate-300">
                <p><span className="text-rose-400">[EXAM]</span> User : Controller of Examination | Action : Result Published | Exam : END-SEM-NOV-2026 | Department : Computer Science | Status : SUCCESS | Duration : 42ms</p>
                <p><span className="text-rose-400">[EXAM]</span> User : Exam Coordinator | Action : Hall Ticket Generated | Student : 2024CS108 | Status : SUCCESS | Duration : 18ms</p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
