import React, { useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useERP } from '../../hooks/useERP';
import { logBackendAction } from '../../utils/backendLogger';
import { Briefcase, CheckCircle2, Users, Award, Clock, FileSpreadsheet, Send } from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const { addToast } = useERP();
  const [gradesSubmitted, setGradesSubmitted] = useState(false);

  const handleSubmitGrades = () => {
    setGradesSubmitted(true);
    logBackendAction(
      'Submitted Moderated Semester 5 Marks for CS301 Database Systems',
      '/api/v1/gradebook/courses/CS301/submit',
      'POST',
      200,
      'faculty.sunita',
      34
    );
    addToast('Marks Submitted', 'Course CS301 marks locked and submitted to Exam Cell.', 'success');
  };

  return (
    <AppLayout>
      <div className="space-y-6 text-left">
        {/* Welcome Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800 text-white shadow-xl shadow-purple-900/20 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-black text-xl text-white">
              SR
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight">Welcome, Dr. Sunita Rao</h1>
                <Badge variant="purple" className="bg-purple-500/20 text-purple-200 border-purple-400/30">
                  Professor & Head
                </Badge>
              </div>
              <p className="text-xs text-purple-200 mt-1">
                Employee ID: <span className="font-mono font-bold">FAC-8012</span> • Department of Computer Science & Engg
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant={gradesSubmitted ? 'secondary' : 'primary'}
              size="sm"
              onClick={handleSubmitGrades}
              disabled={gradesSubmitted}
            >
              <Send className="w-4 h-4 mr-1.5" />
              {gradesSubmitted ? 'Grades Submitted to Exam Cell' : 'Submit CS301 Grades'}
            </Button>
          </div>
        </div>

        {/* Faculty Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 border-l-4 border-l-purple-600">
            <p className="text-xs font-semibold text-slate-500 uppercase">Assigned Courses</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">2 Subjects</h3>
            <span className="text-[11px] text-purple-600 font-medium">CS301 & CS304 Lab</span>
          </Card>
          <Card className="p-4 border-l-4 border-l-brand-600">
            <p className="text-xs font-semibold text-slate-500 uppercase">Total Enrolled Students</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">145 Students</h3>
            <span className="text-[11px] text-brand-600 font-medium">Section A & B</span>
          </Card>
          <Card className="p-4 border-l-4 border-l-emerald-600">
            <p className="text-xs font-semibold text-slate-500 uppercase">Avg Class Performance</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">8.74 / 10 CGPA</h3>
            <span className="text-[11px] text-emerald-600 font-medium">Highest in School</span>
          </Card>
          <Card className="p-4 border-l-4 border-l-amber-500">
            <p className="text-xs font-semibold text-slate-500 uppercase">Attendance Marked</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">100% Up to date</h3>
            <span className="text-[11px] text-amber-600 font-medium">Synced with Biometrics</span>
          </Card>
        </div>

        {/* Assigned Classes & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <Clock className="w-4 h-4 text-purple-600" /> Teaching Schedule & Office Hours
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">CS301 Database Systems</span>
                  <p className="text-slate-500 text-[11px] mt-0.5">Lecture • Room LH-101</p>
                </div>
                <span className="font-mono font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/50 px-2 py-1 rounded">
                  09:00 - 10:00 AM
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">CS304L Advanced OS Lab</span>
                  <p className="text-slate-500 text-[11px] mt-0.5">Practical Lab • Computer Lab 3</p>
                </div>
                <span className="font-mono font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/50 px-2 py-1 rounded">
                  11:15 - 01:15 PM
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <Award className="w-4 h-4 text-emerald-600" /> Pending Mid-Semester Moderation
            </h3>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/30 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">CS301 Mid-Sem Answer Sheets</h4>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">60 Evaluation Papers Moded</p>
                </div>
                <Badge variant="success">Completed</Badge>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  logBackendAction('Exported CS301 Gradebook Sheet', '/api/v1/gradebook/courses/CS301/export', 'GET');
                  addToast('Exported', 'Gradebook spreadsheet downloaded.', 'info');
                }}
              >
                <FileSpreadsheet className="w-4 h-4 mr-1.5" /> Export Class Roster CSV
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};
