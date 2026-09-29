import React, { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useERP } from '../hooks/useERP';
import { logBackendAction } from '../utils/backendLogger';
import { CheckCircle, Clock, RefreshCw, UserCheck, AlertCircle } from 'lucide-react';

interface AttendanceRecord {
  id: string;
  rollNo: string;
  name: string;
  department: string;
  checkInTime: string;
  biometricId: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
}

const initialAttendance: AttendanceRecord[] = [
  { id: 'att-1', rollNo: '2024CS108', name: 'Aarav Sharma', department: 'Computer Science', checkInTime: '08:52 AM', biometricId: 'BIO-9012', status: 'Present' },
  { id: 'att-2', rollNo: '2024EC210', name: 'Ananya Verma', department: 'Electronics', checkInTime: '08:58 AM', biometricId: 'BIO-9014', status: 'Present' },
  { id: 'att-3', rollNo: '2024ME045', name: 'Rohan Gupta', department: 'Mechanical', checkInTime: '09:22 AM', biometricId: 'BIO-9018', status: 'Late' },
  { id: 'att-4', rollNo: '2024CS112', name: 'Priya Nair', department: 'Computer Science', checkInTime: '--', biometricId: 'BIO-9021', status: 'Absent' },
  { id: 'att-5', rollNo: '2024CE019', name: 'Vikram Singh', department: 'Civil', checkInTime: '08:45 AM', biometricId: 'BIO-9025', status: 'Present' },
];

export const AttendancePage: React.FC = () => {
  const { addToast } = useERP();
  const [records, setRecords] = useState<AttendanceRecord[]>(initialAttendance);

  const handleSyncBiometric = () => {
    logBackendAction(
      'Synchronized Campus Biometric Gate Scanner Logs',
      '/api/v1/attendance/biometric/sync',
      'POST',
      200,
      'admin.attendance',
      54,
      'Synced 4,850 student punch-in logs from 12 gateway scanners'
    );
    addToast('Biometric Sync Complete', 'Successfully processed latest gate scanner logs.', 'success');
  };

  const handleMarkStatus = (id: string, newStatus: AttendanceRecord['status']) => {
    const target = records.find((r) => r.id === id);
    setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
    logBackendAction(
      `Manually Updated Attendance for ${target?.rollNo} to ${newStatus}`,
      `/api/v1/attendance/records/${id}`,
      'PUT'
    );
    addToast('Attendance Updated', `${target?.name} marked as ${newStatus}.`, 'info');
  };

  return (
    <AppLayout>
      <div className="space-y-6 text-left">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <CheckCircle className="w-7 h-7 text-emerald-600" /> Biometric & Daily Attendance Register
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Real-time gate punch logs, automated RFID tracking & attendance threshold alerts.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={handleSyncBiometric}>
            <RefreshCw className="w-4 h-4 mr-1.5" /> Sync Biometric Scanners
          </Button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 border-l-4 border-l-emerald-600">
            <p className="text-xs font-semibold text-slate-500 uppercase">Today's Attendance Rate</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">94.8%</h3>
            <span className="text-[11px] text-emerald-600 font-medium">4,597 Present</span>
          </Card>
          <Card className="p-4 border-l-4 border-l-rose-500">
            <p className="text-xs font-semibold text-slate-500 uppercase">Absentees Today</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">253</h3>
            <span className="text-[11px] text-rose-600 font-medium">SMS alerts sent to guardians</span>
          </Card>
          <Card className="p-4 border-l-4 border-l-amber-500">
            <p className="text-xs font-semibold text-slate-500 uppercase">Late Punch-ins</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">42</h3>
            <span className="text-[11px] text-amber-600 font-medium">Post 09:00 AM cutoff</span>
          </Card>
          <Card className="p-4 border-l-4 border-l-brand-600">
            <p className="text-xs font-semibold text-slate-500 uppercase">Biometric Gates Active</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">12 / 12 Gates</h3>
            <span className="text-[11px] text-brand-600 font-medium">100% Online</span>
          </Card>
        </div>

        {/* Attendance Table */}
        <Card className="p-4 space-y-4">
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Roll No</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Biometric Gate ID</th>
                  <th className="p-3">Check-In Time</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Quick Mark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-brand-600">{r.rollNo}</td>
                    <td className="p-3 font-semibold text-slate-900">{r.name}</td>
                    <td className="p-3">{r.department}</td>
                    <td className="p-3 font-mono text-slate-500">{r.biometricId}</td>
                    <td className="p-3 font-mono text-slate-700">{r.checkInTime}</td>
                    <td className="p-3">
                      {r.status === 'Present' && <Badge variant="success">Present</Badge>}
                      {r.status === 'Absent' && <Badge variant="danger">Absent</Badge>}
                      {r.status === 'Late' && <Badge variant="warning">Late</Badge>}
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <button
                        onClick={() => handleMarkStatus(r.id, 'Present')}
                        className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded font-semibold text-[11px]"
                      >
                        P
                      </button>
                      <button
                        onClick={() => handleMarkStatus(r.id, 'Absent')}
                        className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded font-semibold text-[11px]"
                      >
                        A
                      </button>
                      <button
                        onClick={() => handleMarkStatus(r.id, 'Late')}
                        className="px-2 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded font-semibold text-[11px]"
                      >
                        L
                      </button>
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
