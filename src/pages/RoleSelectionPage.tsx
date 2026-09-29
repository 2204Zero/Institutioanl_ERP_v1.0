import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Briefcase, Users, Shield, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Role } from '../types/authTypes';
import { useERP } from '../hooks/useERP';
import { logBackendAction } from '../utils/backendLogger';

interface RoleOption {
  id: Role;
  title: string;
  category: string;
  description: string;
  icon: React.ReactNode;
  accentColor: string;
  badgeBg: string;
  permissions: string[];
}

const roleOptions: RoleOption[] = [
  {
    id: 'Student',
    title: 'Student Portal',
    category: 'Academic Learner',
    description: 'Access enrolled courses, CGPA progress, class schedules, biometric attendance & fee receipts.',
    icon: <GraduationCap className="w-8 h-8 text-blue-600" />,
    accentColor: 'border-l-blue-600 hover:border-blue-500',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    permissions: ['View Transcripts', 'Check Attendance', 'Download Receipts', 'Library Access'],
  },
  {
    id: 'Teacher',
    title: 'Faculty & Educator',
    category: 'Academic Staff',
    description: 'Manage class rosters, publish semester grades, mark attendance & assign lab slots.',
    icon: <Briefcase className="w-8 h-8 text-purple-600" />,
    accentColor: 'border-l-purple-600 hover:border-purple-500',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    permissions: ['Marks Moderation', 'Attendance Marking', 'Course Management', 'Timetable'],
  },
  {
    id: 'Parent',
    title: 'Guardian & Parent',
    category: 'Family Portal',
    description: 'Track ward attendance, view detailed academic reports & pay tuition fees via online UPI.',
    icon: <Users className="w-8 h-8 text-emerald-600" />,
    accentColor: 'border-l-emerald-600 hover:border-emerald-500',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    permissions: ['Ward Progress', 'Fee Payment UPI', 'Teacher Notice Board', 'Dues Alert'],
  },
  {
    id: 'Admin',
    title: 'Administrator',
    category: 'Institutional Control',
    description: 'Institutional financial ledger, staff payroll disbursement, RBAC authorization & server logs.',
    icon: <Shield className="w-8 h-8 text-amber-600" />,
    accentColor: 'border-l-amber-600 hover:border-amber-500',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    permissions: ['Full Ledger Audit', 'Payroll Run', 'RBAC Policies', 'System Terminal'],
  },
];

export const RoleSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useERP();

  const handleSelectRole = (role: Role) => {
    localStorage.setItem('selectedRole', role);
    logBackendAction(
      `Selected Authentication Workspace Role: ${role}`,
      `/api/v1/auth/roles/select`,
      'POST',
      200,
      `guest.${role.toLowerCase()}`
    );
    addToast('Role Selected', `Entering login workspace as ${role}.`, 'info');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-6 md:p-12 font-sans selection:bg-brand-500 selection:text-white">
      {/* Brand Header */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-brand-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white">EdERP Suite v2.4</h1>
            <p className="text-[11px] text-slate-400 font-mono">Enterprise Educational System</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/login')}
          className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1 font-semibold"
        >
          Skip to Direct Login <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl w-full mx-auto my-12 text-left">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" /> Multi-Role Portal Authentication
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Select Your Portal Role
          </h2>
          <p className="text-sm text-slate-400">
            Choose your institutional identity to unlock personalized dashboards, specialized permissions, and domain tools.
          </p>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roleOptions.map((role) => (
            <Card
              key={role.id}
              className={`p-6 bg-slate-800/80 border-slate-700/80 border-l-4 ${role.accentColor} hover:bg-slate-800 hover:shadow-xl transition-all duration-200 flex flex-col justify-between group cursor-pointer`}
              onClick={() => handleSelectRole(role.id)}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-700/80 group-hover:scale-105 transition-transform">
                    {role.icon}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${role.badgeBg}`}>
                    {role.category}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-extrabold text-white group-hover:text-brand-400 transition-colors">
                    {role.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {role.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-700/60 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Key Features</span>
                  {role.permissions.map((perm, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{perm}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs font-bold text-brand-400 group-hover:translate-x-1 transition-transform">
                <span>Access Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl w-full mx-auto text-center text-xs text-slate-500 font-mono">
        Strict Role-Based Access Control (RBAC) Enforced • Spring Boot Security Gateway v2.4
      </div>
    </div>
  );
};
