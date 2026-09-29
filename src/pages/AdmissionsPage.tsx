import React, { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { useERP } from '../hooks/useERP';
import { logBackendAction } from '../utils/backendLogger';
import { UserCheck, Search, Filter, Download, Plus, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Applicant {
  id: string;
  applicationNo: string;
  name: string;
  category: string;
  department: string;
  entranceScore: number;
  status: 'Approved' | 'Under Review' | 'Rejected' | 'Provisionally Admitted';
  appliedDate: string;
}

const initialApplicants: Applicant[] = [
  { id: 'app-1', applicationNo: 'ADM-2026-1049', name: 'Devansh Kulkarni', category: 'General', department: 'Computer Science', entranceScore: 198, status: 'Approved', appliedDate: '2026-09-10' },
  { id: 'app-2', applicationNo: 'ADM-2026-1050', name: 'Meera Deshmukh', category: 'OBC', department: 'Electronics', entranceScore: 184, status: 'Under Review', appliedDate: '2026-09-12' },
  { id: 'app-3', applicationNo: 'ADM-2026-1051', name: 'Karan Mehra', category: 'General', department: 'Mechanical', entranceScore: 172, status: 'Provisionally Admitted', appliedDate: '2026-09-14' },
  { id: 'app-4', applicationNo: 'ADM-2026-1052', name: 'Sanya Mirza', category: 'SC', department: 'Computer Science', entranceScore: 191, status: 'Approved', appliedDate: '2026-09-15' },
  { id: 'app-5', applicationNo: 'ADM-2026-1053', name: 'Rahul Bose', category: 'ST', department: 'Civil', entranceScore: 156, status: 'Rejected', appliedDate: '2026-09-16' },
];

export const AdmissionsPage: React.FC = () => {
  const { addToast } = useERP();
  const [applicants, setApplicants] = useState<Applicant[]>(initialApplicants);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const handleUpdateStatus = (id: string, newStatus: Applicant['status']) => {
    const target = applicants.find((a) => a.id === id);
    setApplicants((prev) => prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));
    logBackendAction(
      `Updated Admissions Application Status to ${newStatus}`,
      `/api/v1/admissions/applications/${id}/status`,
      'PUT',
      200,
      'admin.admissions',
      24,
      `Applicant: ${target?.name} (${target?.applicationNo})`
    );
    addToast('Status Updated', `Application ${target?.applicationNo} status changed to ${newStatus}.`, 'info');
  };

  const handleNewApplicant = () => {
    const newId = `app-${Date.now()}`;
    const newAppNo = `ADM-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const names = ['Aman Joshi', 'Neha Bhat', 'Tanvi Saxena', 'Siddharth Iyer'];
    const depts = ['Computer Science', 'Electronics', 'Information Tech', 'Electrical'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomDept = depts[Math.floor(Math.random() * depts.length)];

    const newApplicant: Applicant = {
      id: newId,
      applicationNo: newAppNo,
      name: randomName,
      category: 'General',
      department: randomDept,
      entranceScore: Math.floor(160 + Math.random() * 40),
      status: 'Under Review',
      appliedDate: new Date().toISOString().slice(0, 10),
    };

    setApplicants((prev) => [newApplicant, ...prev]);
    logBackendAction(
      'Registered New Admissions Applicant Application',
      '/api/v1/admissions/applications',
      'POST',
      201,
      'admin.admissions',
      35,
      `Application No: ${newAppNo}`
    );
    addToast('Applicant Registered', `Created application #${newAppNo} for ${randomName}.`, 'success');
  };

  const filteredApplicants = applicants.filter((a) => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.applicationNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = departmentFilter === 'All' || a.department === departmentFilter;
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const getStatusBadge = (status: Applicant['status']) => {
    switch (status) {
      case 'Approved':
        return <Badge variant="success">Approved</Badge>;
      case 'Provisionally Admitted':
        return <Badge variant="info">Provisionally Admitted</Badge>;
      case 'Under Review':
        return <Badge variant="warning">Under Review</Badge>;
      case 'Rejected':
        return <Badge variant="danger">Rejected</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 text-left">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <UserCheck className="w-7 h-7 text-brand-600" /> Admissions & Intake Portal
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage student intake applications, entrance cutoff rankings & seat allotment registers.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => logBackendAction('Exported Admissions Ledger', '/api/v1/admissions/export', 'GET', 200)}>
              <Download className="w-4 h-4 mr-1.5" /> Export Data
            </Button>
            <Button variant="primary" size="sm" onClick={handleNewApplicant}>
              <Plus className="w-4 h-4 mr-1.5" /> New Application
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 border-l-4 border-l-brand-600">
            <p className="text-xs font-semibold text-slate-500 uppercase">Total Applications</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">1,420</h3>
            <span className="text-[11px] text-emerald-600 font-medium">+12% vs last session</span>
          </Card>
          <Card className="p-4 border-l-4 border-l-emerald-500">
            <p className="text-xs font-semibold text-slate-500 uppercase">Seats Confirmed</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">680 / 800</h3>
            <span className="text-[11px] text-emerald-600 font-medium">85% Seat Capacity Met</span>
          </Card>
          <Card className="p-4 border-l-4 border-l-amber-500">
            <p className="text-xs font-semibold text-slate-500 uppercase">Under Review</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">315</h3>
            <span className="text-[11px] text-amber-600 font-medium">Verification in progress</span>
          </Card>
          <Card className="p-4 border-l-4 border-l-purple-500">
            <p className="text-xs font-semibold text-slate-500 uppercase">Avg Entrance Score</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">182.4 / 200</h3>
            <span className="text-[11px] text-purple-600 font-medium">Cutoff Ranking 92%</span>
          </Card>
        </div>

        {/* Table Controls */}
        <Card className="p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-[240px]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <Input
                  placeholder="Search applicant name, application #..."
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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { label: 'All Statuses', value: 'All' },
                  { label: 'Approved', value: 'Approved' },
                  { label: 'Provisionally Admitted', value: 'Provisionally Admitted' },
                  { label: 'Under Review', value: 'Under Review' },
                  { label: 'Rejected', value: 'Rejected' },
                ]}
                className="w-44 text-xs py-1.5"
              />
            </div>
            <span className="text-xs font-medium text-slate-500">
              Showing {filteredApplicants.length} applications
            </span>
          </div>

          {/* Applications Data Table */}
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Application #</th>
                  <th className="p-3">Applicant Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Department</th>
                  <th className="p-3 text-center">Score</th>
                  <th className="p-3">Applied Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredApplicants.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-brand-600">{app.applicationNo}</td>
                    <td className="p-3 font-semibold text-slate-900">{app.name}</td>
                    <td className="p-3">{app.category}</td>
                    <td className="p-3">{app.department}</td>
                    <td className="p-3 text-center font-bold text-slate-800">{app.entranceScore}</td>
                    <td className="p-3 font-mono text-slate-500">{app.appliedDate}</td>
                    <td className="p-3">{getStatusBadge(app.status)}</td>
                    <td className="p-3 text-right space-x-1">
                      {app.status !== 'Approved' && (
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'Approved')}
                          className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded font-semibold text-[11px]"
                        >
                          Approve
                        </button>
                      )}
                      {app.status !== 'Rejected' && (
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'Rejected')}
                          className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded font-semibold text-[11px]"
                        >
                          Reject
                        </button>
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
