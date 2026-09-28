import React from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useERP } from '../../hooks/useERP';
import { logBackendAction } from '../../utils/backendLogger';
import { GraduationCap, Award, CheckCircle2, BookOpen, Clock, Download, DollarSign, Calendar } from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { addToast } = useERP();

  const handleDownloadTranscript = () => {
    logBackendAction(
      'Downloaded Cryptographically Signed Official Student Academic Transcript PDF',
      '/api/v1/sis/students/2024CS108/transcript',
      'GET',
      200,
      'student.aarav',
      42
    );
    addToast('Transcript Downloaded', 'Official Academic Transcript saved to downloads folder.', 'success');
  };

  return (
    <AppLayout>
      <div className="space-y-6 text-left">
        {/* Welcome Header */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-700 via-brand-600 to-indigo-700 text-white shadow-xl shadow-brand-600/20 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-black text-xl text-white">
              AS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight">Welcome back, Aarav Sharma!</h1>
                <Badge variant="success" className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30">
                  Active Student
                </Badge>
              </div>
              <p className="text-xs text-brand-100 mt-1">
                Roll No: <span className="font-mono font-bold">2024CS108</span> • B.Tech Computer Science & Engg • Semester 5
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" onClick={handleDownloadTranscript}>
              <Download className="w-4 h-4 mr-1.5" /> Official Transcript
            </Button>
          </div>
        </div>

        {/* Student KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 border-l-4 border-l-brand-600">
            <p className="text-xs font-semibold text-slate-500 uppercase">Current CGPA</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">8.90 / 10</h3>
            <span className="text-[11px] text-emerald-600 font-medium">Rank #4 in Department</span>
          </Card>
          <Card className="p-4 border-l-4 border-l-emerald-600">
            <p className="text-xs font-semibold text-slate-500 uppercase">Biometric Attendance</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">94.8%</h3>
            <span className="text-[11px] text-emerald-600 font-medium">Eligible for Final Exams</span>
          </Card>
          <Card className="p-4 border-l-4 border-l-purple-600">
            <p className="text-xs font-semibold text-slate-500 uppercase">Semester Tuition Status</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹ 85,000 Paid</h3>
            <span className="text-[11px] text-emerald-600 font-medium">Zero Dues Pending</span>
          </Card>
          <Card className="p-4 border-l-4 border-l-amber-500">
            <p className="text-xs font-semibold text-slate-500 uppercase">Library Volumes Issued</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">2 Books</h3>
            <span className="text-[11px] text-amber-600 font-medium">Due in 6 Days</span>
          </Card>
        </div>

        {/* Today's Schedule & Enrolled Courses */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Lectures Timeline */}
          <Card className="p-5 space-y-4 lg:col-span-1">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-600" /> Today's Lecture Slots
              </h3>
              <span className="text-[10px] font-mono font-bold text-slate-400">Monday</span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                  <span>Database Systems</span>
                  <span className="font-mono text-brand-600 text-[11px]">09:00 - 10:00 AM</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Room LH-101 • Dr. Sunita Rao</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                  <span>Distributed Systems</span>
                  <span className="font-mono text-brand-600 text-[11px]">10:00 - 11:00 AM</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Room LH-102 • Prof. Ankit Patel</p>
              </div>

              <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60">
                <div className="flex items-center justify-between text-xs font-bold text-purple-900 dark:text-purple-200">
                  <span>Advanced OS Lab</span>
                  <span className="font-mono text-purple-700 dark:text-purple-400 text-[11px]">11:15 - 01:15 PM</span>
                </div>
                <p className="text-[11px] text-purple-700 dark:text-purple-300 mt-1">Computer Lab 3 • Practical</p>
              </div>
            </div>
          </Card>

          {/* Registered Courses Progress */}
          <Card className="p-5 space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-brand-600" /> Semester 5 Course Enrollments
              </h3>
              <span className="text-xs font-semibold text-slate-500">6 Enrolled Courses</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { code: 'CS301', name: 'Database Systems', credits: 4, grade: 'A+', attendance: '96%' },
                { code: 'CS304', name: 'Distributed Systems', credits: 4, grade: 'A', attendance: '92%' },
                { code: 'CS308', name: 'Computer Networks', credits: 4, grade: 'A+', attendance: '95%' },
                { code: 'CS312', name: 'Machine Learning Basics', credits: 3, grade: 'A', attendance: '94%' },
              ].map((course) => (
                <div key={course.code} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-brand-600">{course.code}</span>
                    <Badge variant="purple">Grade: {course.grade}</Badge>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{course.name}</h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span>{course.credits} Credits</span>
                    <span className="text-emerald-600 font-semibold">Att: {course.attendance}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};
