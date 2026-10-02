import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const routeNameMap: Record<string, string> = {
    dashboard: 'Dashboard',
    sis: 'Student Information System',
    finance: 'Finance & Fee Management',
    academics: 'Academics & Courses',
    attendance: 'Attendance Management',
    settings: 'System Settings',
    login: 'Login Portal',
  };

  return (
    <nav className="flex items-center text-xs text-slate-500 dark:text-slate-400 space-x-1.5" aria-label="Breadcrumb">
      <Link to="/dashboard" className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
        <Home className="w-3.5 h-3.5" />
      </Link>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const name = routeNameMap[value.toLowerCase()] || value.charAt(0).toUpperCase() + value.slice(1);

        return (
          <React.Fragment key={to}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {isLast ? (
              <span className="font-semibold text-slate-800 dark:text-slate-200">{name}</span>
            ) : (
              <Link to={to} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {name}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
