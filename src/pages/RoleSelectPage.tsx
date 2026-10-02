import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, UserCheck, Users, ShieldCheck, ArrowRight } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ThemeToggle } from '../components/layout/ThemeToggle';

export const RoleSelectPage: React.FC = () => {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'student',
      title: 'Student Portal',
      description: 'Access academic records, view attendance, check timetables, and pay institutional fees.',
      icon: <GraduationCap className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
      color: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900',
      badge: 'Academic Access',
    },
    {
      id: 'faculty',
      title: 'Faculty Portal',
      description: 'Manage course curriculums, mark daily attendance, grade students, and review schedules.',
      icon: <UserCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />,
      color: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900',
      badge: 'Educator Suite',
    },
    {
      id: 'parent',
      title: 'Parent Portal',
      description: 'Track ward progress, review fee statements, monitor attendance, and receive alerts.',
      icon: <Users className="w-8 h-8 text-amber-600 dark:text-amber-400" />,
      color: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900',
      badge: 'Guardian Access',
    },
    {
      id: 'admin',
      title: 'Administrator Portal',
      description: 'System configuration, user role management, finance ledger auditing, and SIS administration.',
      icon: <ShieldCheck className="w-8 h-8 text-purple-600 dark:text-purple-400" />,
      color: 'bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-900',
      badge: 'System Control',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between p-6 md:p-12 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="flex items-center justify-between max-w-6xl w-full mx-auto relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            ERP
          </div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-slate-100 text-lg leading-tight">Institutional ERP</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Enterprise Educational Management</p>
          </div>
        </div>

        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="max-w-6xl w-full mx-auto my-12 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <Badge variant="primary">Unified Access Gateway</Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Select Your Account Role
          </h2>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">
            Welcome to the Institutional ERP Suite. Please select your role to proceed to your dedicated authentication portal.
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role) => (
            <Card
              key={role.id}
              onClick={() => navigate(`/login/${role.id}`)}
              className="p-6 cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group border-2 border-transparent hover:border-blue-500"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-2xl border ${role.color}`}>{role.icon}</div>
                  <Badge variant="neutral">{role.badge}</Badge>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {role.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {role.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                <span>Access Portal</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Card>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 dark:text-slate-600 relative z-10">
        &copy; {new Date().getFullYear()} Institutional ERP Platform. Powered by Spring Boot & React Enterprise Architecture.
      </footer>
    </div>
  );
};
