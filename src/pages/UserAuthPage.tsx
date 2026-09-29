import React, { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useERP } from '../hooks/useERP';
import { logBackendAction } from '../utils/backendLogger';
import { Shield, Lock, Key, Users, AlertOctagon, CheckCircle2, UserX } from 'lucide-react';

interface SystemUser {
  id: string;
  username: string;
  fullName: string;
  role: 'SuperAdmin' | 'Admin' | 'Dean' | 'Faculty' | 'Student';
  mfaEnabled: boolean;
  lastLogin: string;
  status: 'Active' | 'Locked' | 'Suspended';
}

const initialUsers: SystemUser[] = [
  { id: 'usr-1', username: 'admin.rajesh', fullName: 'Dr. Rajesh Kumar', role: 'Dean', mfaEnabled: true, lastLogin: '2026-09-28 12:45', status: 'Active' },
  { id: 'usr-2', username: 'sunita.rao', fullName: 'Dr. Sunita Rao', role: 'Faculty', mfaEnabled: true, lastLogin: '2026-09-28 10:15', status: 'Active' },
  { id: 'usr-3', username: 'sysadmin.super', fullName: 'System Super Admin', role: 'SuperAdmin', mfaEnabled: true, lastLogin: '2026-09-28 13:00', status: 'Active' },
  { id: 'usr-4', username: 'fin.controller', fullName: 'Anil Mehta', role: 'Admin', mfaEnabled: false, lastLogin: '2026-09-27 16:30', status: 'Active' },
];

export const UserAuthPage: React.FC = () => {
  const { addToast } = useERP();
  const [users, setUsers] = useState<SystemUser[]>(initialUsers);

  const handleToggleLock = (id: string) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;
    const newStatus = target.status === 'Active' ? 'Locked' : 'Active';

    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: newStatus } : u)));

    logBackendAction(
      `Changed Account Authorization Status for ${target.username} to ${newStatus}`,
      `/api/v1/auth/users/${target.id}/lock`,
      'PUT',
      200,
      'superadmin.sec',
      19
    );
    addToast('Security Status Updated', `Account ${target.username} marked as ${newStatus}.`, 'warning');
  };

  return (
    <AppLayout>
      <div className="space-y-6 text-left">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Shield className="w-7 h-7 text-brand-600" /> User & Role Authorization (RBAC)
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Role-based access control, OAuth 2.0 provider tokens, session security & MFA policy control.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              logBackendAction('Audited Security Access Matrix Policies', '/api/v1/auth/audit-matrix', 'GET');
              addToast('Security Audit Passed', 'All 250+ API endpoint permission locks verified.', 'success');
            }}
          >
            <Lock className="w-4 h-4 mr-1.5" /> Run RBAC Audit Check
          </Button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 border-l-4 border-l-brand-600">
            <p className="text-xs font-semibold text-slate-500 uppercase">System Active Accounts</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">5,190</h3>
            <span className="text-[11px] text-emerald-600 font-medium">OAuth & JWT Authenticated</span>
          </Card>
          <Card className="p-4 border-l-4 border-l-emerald-600">
            <p className="text-xs font-semibold text-slate-500 uppercase">MFA Adoption Rate</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">98.2%</h3>
            <span className="text-[11px] text-emerald-600 font-medium">Mandatory for Admin Roles</span>
          </Card>
          <Card className="p-4 border-l-4 border-l-purple-600">
            <p className="text-xs font-semibold text-slate-500 uppercase">Configured RBAC Roles</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">6 System Roles</h3>
            <span className="text-[11px] text-purple-600 font-medium">SuperAdmin, Admin, Dean, Faculty, Student, Guest</span>
          </Card>
          <Card className="p-4 border-l-4 border-l-rose-500">
            <p className="text-xs font-semibold text-slate-500 uppercase">Security Lockouts</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">0 Breach Alerts</h3>
            <span className="text-[11px] text-emerald-600 font-medium">Spring Security Sentinel Active</span>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="p-4 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Registered System Accounts & Access Rights</h3>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Username</th>
                  <th className="p-3">Full Name</th>
                  <th className="p-3">Assigned Role</th>
                  <th className="p-3 text-center">2FA / MFA</th>
                  <th className="p-3">Last Active</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-brand-600">{u.username}</td>
                    <td className="p-3 font-semibold text-slate-900">{u.fullName}</td>
                    <td className="p-3 font-bold text-purple-700">{u.role}</td>
                    <td className="p-3 text-center">
                      {u.mfaEnabled ? (
                        <Badge variant="success">Enabled</Badge>
                      ) : (
                        <Badge variant="warning">Disabled</Badge>
                      )}
                    </td>
                    <td className="p-3 font-mono text-slate-500">{u.lastLogin}</td>
                    <td className="p-3">
                      {u.status === 'Active' ? <Badge variant="success">Active</Badge> : <Badge variant="danger">Locked</Badge>}
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        variant={u.status === 'Active' ? 'outline' : 'primary'}
                        size="sm"
                        onClick={() => handleToggleLock(u.id)}
                      >
                        {u.status === 'Active' ? 'Lock Account' : 'Unlock Account'}
                      </Button>
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
