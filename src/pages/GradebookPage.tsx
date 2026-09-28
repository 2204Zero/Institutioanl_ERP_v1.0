import React, { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useERP } from '../hooks/useERP';
import { logBackendAction } from '../utils/backendLogger';
import { Award, CheckCircle2, Download, Send, FileSpreadsheet, Lock } from 'lucide-react';

interface GradeRecord {
  id: string;
  rollNo: string;
  studentName: string;
  department: string;
  midSemMarks: number;
  endSemMarks: number;
  totalMarks: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'F';
  cgpa: number;
  resultStatus: 'Passed' | 'Backlog';
}

const initialGrades: GradeRecord[] = [
  { id: 'g-1', rollNo: '2024CS108', studentName: 'Aarav Sharma', department: 'Computer Science', midSemMarks: 28, endSemMarks: 64, totalMarks: 92, grade: 'A+', cgpa: 8.9, resultStatus: 'Passed' },
  { id: 'g-2', rollNo: '2024EC210', studentName: 'Ananya Verma', department: 'Electronics', midSemMarks: 29, endSemMarks: 67, totalMarks: 96, grade: 'A+', cgpa: 9.2, resultStatus: 'Passed' },
  { id: 'g-3', rollNo: '2024ME045', studentName: 'Rohan Gupta', department: 'Mechanical', midSemMarks: 22, endSemMarks: 52, totalMarks: 74, grade: 'B+', cgpa: 7.8, resultStatus: 'Passed' },
  { id: 'g-4', rollNo: '2024CS112', studentName: 'Priya Nair', department: 'Computer Science', midSemMarks: 26, endSemMarks: 60, totalMarks: 86, grade: 'A', cgpa: 8.5, resultStatus: 'Passed' },
  { id: 'g-5', rollNo: '2024CE019', studentName: 'Vikram Singh', department: 'Civil', midSemMarks: 14, endSemMarks: 28, totalMarks: 42, grade: 'F', cgpa: 5.4, resultStatus: 'Backlog' },
];

export const GradebookPage: React.FC = () => {
  const { addToast } = useERP();
  const [isPublished, setIsPublished] = useState(false);

  const handlePublishResults = () => {
    setIsPublished(true);
    logBackendAction(
      'Published Final Semester 5 Examination Results & Transcripts',
      '/api/v1/gradebook/results/publish',
      'POST',
      200,
      'admin.examCell',
      68,
      'Cryptographically signed marks ledger for 4,850 students'
    );
    addToast('Results Published!', 'Semester 5 transcripts published to Student Portals.', 'success');
  };

  return (
    <AppLayout>
      <div className="space-y-6 text-left">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Award className="w-7 h-7 text-brand-600" /> Gradebook & Examination Control
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Marks moderation, CGPA calculations, backlog tracking & transcript generation.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => logBackendAction('Exported Gradebook Spreadsheet', '/api/v1/gradebook/export', 'GET')}
            >
              <FileSpreadsheet className="w-4 h-4 mr-1.5" /> Export Ledger
            </Button>
            <Button
              variant={isPublished ? 'secondary' : 'primary'}
              size="sm"
              onClick={handlePublishResults}
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

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 border-l-4 border-l-brand-600">
            <p className="text-xs font-semibold text-slate-500 uppercase">Class Average CGPA</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">8.24 / 10</h3>
            <span className="text-[11px] text-emerald-600 font-medium">+0.3 vs last semester</span>
          </Card>
          <Card className="p-4 border-l-4 border-l-emerald-600">
            <p className="text-xs font-semibold text-slate-500 uppercase">Pass Percentage</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">96.4%</h3>
            <span className="text-[11px] text-emerald-600 font-medium">4,675 Passed Clean</span>
          </Card>
          <Card className="p-4 border-l-4 border-l-rose-500">
            <p className="text-xs font-semibold text-slate-500 uppercase">Backlog Candidates</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">175</h3>
            <span className="text-[11px] text-rose-600 font-medium">Re-exam scheduled for Oct</span>
          </Card>
          <Card className="p-4 border-l-4 border-l-purple-600">
            <p className="text-xs font-semibold text-slate-500 uppercase">Highest Score</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">9.82 CGPA</h3>
            <span className="text-[11px] text-purple-600 font-medium">Dept of Computer Science</span>
          </Card>
        </div>

        {/* Grade Table */}
        <Card className="p-4 space-y-4">
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Roll No</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Department</th>
                  <th className="p-3 text-center">Mid-Sem (30)</th>
                  <th className="p-3 text-center">End-Sem (70)</th>
                  <th className="p-3 text-center">Total (100)</th>
                  <th className="p-3 text-center">Grade</th>
                  <th className="p-3 text-center">CGPA</th>
                  <th className="p-3 text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {initialGrades.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-brand-600">{g.rollNo}</td>
                    <td className="p-3 font-semibold text-slate-900">{g.studentName}</td>
                    <td className="p-3">{g.department}</td>
                    <td className="p-3 text-center font-mono">{g.midSemMarks}</td>
                    <td className="p-3 text-center font-mono">{g.endSemMarks}</td>
                    <td className="p-3 text-center font-bold text-slate-900">{g.totalMarks}</td>
                    <td className="p-3 text-center font-extrabold text-brand-600">{g.grade}</td>
                    <td className="p-3 text-center font-mono font-bold text-slate-800">{g.cgpa}</td>
                    <td className="p-3 text-right">
                      {g.resultStatus === 'Passed' ? (
                        <Badge variant="success">Passed</Badge>
                      ) : (
                        <Badge variant="danger">Backlog</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};
