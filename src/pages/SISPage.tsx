import React, { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { useERP } from '../hooks/useERP';
import { logBackendAction } from '../utils/backendLogger';
import { StudentDetailModal } from '../components/modals/StudentDetailModal';
import { Users, Search, Download, Plus, Mail, Eye, Bell } from 'lucide-react';

export const SISPage: React.FC = () => {
  const { students, openStudentDetailModal, sendReminder, addToast } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [semesterFilter, setSemesterFilter] = useState('All');

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = departmentFilter === 'All' || s.department === departmentFilter;
    const matchesSem = semesterFilter === 'All' || s.semester === semesterFilter;
    return matchesSearch && matchesDept && matchesSem;
  });

  const handleExportCSV = () => {
    logBackendAction(
      'Exported Student Directory Roster',
      '/api/v1/sis/students/export',
      'GET',
      200,
      'admin.sis',
      18
    );
    const headers = 'Roll No,Name,Email,Department,Semester,CGPA,Status\n';
    const rows = filteredStudents
      .map((s) => `"${s.rollNo}","${s.name}","${s.email}","${s.department}","${s.semester}",${s.cgpa},"${s.status}"`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SIS_Student_Roster_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    addToast('Roster Exported', 'Student Information System data downloaded.', 'success');
  };

  return (
    <AppLayout>
      <div className="space-y-6 text-left">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-7 h-7 text-brand-600" /> Student Information System (SIS)
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Centralized registry of student profiles, enrollment status, academic transcripts & dues.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-1.5" /> Export Directory
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                logBackendAction('Initiated New Student Registration Form', '/api/v1/sis/students/new', 'POST');
                openStudentDetailModal('New Student Candidate');
              }}
            >
              <Plus className="w-4 h-4 mr-1.5" /> Add Student
            </Button>
          </div>
        </div>

        {/* Executive Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 border-l-4 border-l-brand-600">
            <p className="text-xs font-semibold text-slate-500 uppercase">Enrolled Active Students</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">4,850</h3>
            <span className="text-[11px] text-emerald-600 font-medium">99.2% Retention Rate</span>
          </Card>
          <Card className="p-4 border-l-4 border-l-purple-600">
            <p className="text-xs font-semibold text-slate-500 uppercase">Average Institution CGPA</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">8.54 / 10</h3>
            <span className="text-[11px] text-purple-600 font-medium">Top 5% University Rank</span>
          </Card>
          <Card className="p-4 border-l-4 border-l-amber-500">
            <p className="text-xs font-semibold text-slate-500 uppercase">Pending Fee Dues</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">₹ 1.27 Cr</h3>
            <span className="text-[11px] text-amber-600 font-medium">42 Students Overdue</span>
          </Card>
          <Card className="p-4 border-l-4 border-l-emerald-600">
            <p className="text-xs font-semibold text-slate-500 uppercase">Graduation Eligibility</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">1,120 Candidates</h3>
            <span className="text-[11px] text-emerald-600 font-medium">Batch of 2026</span>
          </Card>
        </div>

        {/* Search & Roster Controls */}
        <Card className="p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-[240px]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <Input
                  placeholder="Search student name, roll number, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 text-xs"
                />
              </div>
              <Select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                options={[
                  { label: 'All Departments', value: 'All' },
                  { label: 'Computer Science', value: 'Computer Science' },
                  { label: 'Electronics', value: 'Electronics' },
                  { label: 'Mechanical', value: 'Mechanical' },
                  { label: 'Civil', value: 'Civil' },
                ]}
                className="w-44 text-xs py-1.5"
              />
              <Select
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                options={[
                  { label: 'All Semesters', value: 'All' },
                  { label: 'Semester 5', value: 'Semester 5' },
                  { label: 'Semester 3', value: 'Semester 3' },
                  { label: 'Semester 1', value: 'Semester 1' },
                ]}
                className="w-44 text-xs py-1.5"
              />
            </div>
            <span className="text-xs font-medium text-slate-500">
              Showing {filteredStudents.length} of {students.length} record(s)
            </span>
          </div>

          {/* Student Roster Table */}
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Roll No</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Semester</th>
                  <th className="p-3 text-center">CGPA</th>
                  <th className="p-3 text-right">Fee Dues</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-brand-600">{st.rollNo}</td>
                    <td className="p-3 font-semibold text-slate-900">
                      <div>{st.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{st.email}</div>
                    </td>
                    <td className="p-3">{st.department}</td>
                    <td className="p-3">{st.semester}</td>
                    <td className="p-3 text-center font-bold text-slate-800">{st.cgpa}</td>
                    <td className="p-3 text-right font-mono font-semibold">
                      {st.totalDues > 0 ? (
                        <span className="text-rose-600">₹{st.totalDues.toLocaleString('en-IN')}</span>
                      ) : (
                        <span className="text-emerald-600">Clear</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant="success">Active</Badge>
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          logBackendAction(`Inspected Student Profile ${st.rollNo}`, `/api/v1/sis/students/${st.rollNo}`, 'GET');
                          openStudentDetailModal(st);
                        }}
                        title="View Full Profile"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      {st.totalDues > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            logBackendAction(`Sent SMS/Email Dues Alert to ${st.rollNo}`, `/api/v1/sis/students/${st.rollNo}/remind`, 'POST');
                            sendReminder(st.name, st.rollNo);
                          }}
                          className="text-amber-600 hover:bg-amber-50"
                          title="Send Due Fee Alert"
                        >
                          <Bell className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <StudentDetailModal />
    </AppLayout>
  );
};
