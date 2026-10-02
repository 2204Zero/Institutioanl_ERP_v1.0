import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BookOpen,
  Calendar,
  Settings,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShieldAlert,
} from 'lucide-react';
import { useERP } from '../../hooks/useERP';
import { useGlobalStore } from '../../store/StoreContext';
import { cn } from '../../utils/cn';

export const Sidebar: React.FC = () => {
  const { isSidebarCollapsed, toggleSidebar } = useERP();
  const { state, dispatch } = useGlobalStore();
  const location = useLocation();

  const userRole = state.user?.role || 'ADMIN';

  const navItems = [
    {
      id: 'dashboard',
      label: 'Executive Overview',
      path: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5 shrink-0" />,
      roles: ['STUDENT', 'FACULTY', 'PARENT', 'ADMIN', 'FINANCE_OFFICER'],
    },
    {
      id: 'sis',
      label: 'Student Information System',
      path: '/sis',
      icon: <GraduationCap className="w-5 h-5 shrink-0" />,
      roles: ['FACULTY', 'ADMIN'],
    },
    {
      id: 'finance',
      label: 'Finance & Ledger',
      path: '/finance',
      icon: <CreditCard className="w-5 h-5 shrink-0" />,
      roles: ['STUDENT', 'ADMIN', 'FINANCE_OFFICER'],
    },
    {
      id: 'academics',
      label: 'Academics & Courses',
      path: '/academics',
      icon: <BookOpen className="w-5 h-5 shrink-0" />,
      roles: ['STUDENT', 'FACULTY', 'ADMIN'],
    },
    {
      id: 'attendance',
      label: 'Attendance Portal',
      path: '/attendance',
      icon: <Calendar className="w-5 h-5 shrink-0" />,
      roles: ['STUDENT', 'FACULTY', 'ADMIN'],
    },
    {
      id: 'settings',
      label: 'System Settings',
      path: '/settings',
      icon: <Settings className="w-5 h-5 shrink-0" />,
      roles: ['ADMIN'],
    },
  ];

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 z-40 h-screen bg-slate-900 text-slate-300 transition-all duration-300 border-r border-slate-800 flex flex-col select-none',
        isSidebarCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shrink-0">
            ERP
          </div>
          {!isSidebarCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-slate-100 text-sm tracking-wide truncate">Institutional ERP</span>
              <span className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider">Enterprise v2.4</span>
            </div>
          )}
        </div>

        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          aria-label={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 no-scrollbar">
        {!isSidebarCollapsed && (
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Navigation Menu
          </div>
        )}

        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group',
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
              )
            }
          >
            {item.icon}
            {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <div className={cn('flex items-center gap-3', isSidebarCollapsed ? 'justify-center' : 'justify-between')}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200 text-xs shrink-0">
              {state.user?.firstName ? state.user.firstName[0] : 'U'}
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-semibold text-slate-200 truncate">
                  {state.user?.firstName ? `${state.user.firstName} ${state.user.lastName}` : 'System User'}
                </span>
                <span className="text-[10px] text-slate-400 truncate">{state.user?.role || 'Guest'}</span>
              </div>
            )}
          </div>

          {!isSidebarCollapsed && (
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 transition-colors"
              title="Logout Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
