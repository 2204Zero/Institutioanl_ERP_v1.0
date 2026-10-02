import React from 'react';
import { Search, Bell, Command, User, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { useERP } from '../../hooks/useERP';
import { useGlobalStore } from '../../store/StoreContext';
import { ThemeToggle } from './ThemeToggle';
import { Breadcrumbs } from './Breadcrumbs';
import { Dropdown } from '../ui/Dropdown';
import { useNavigate } from 'react-router-dom';

export const Topbar: React.FC = () => {
  const { setGlobalSearchOpen, notifications, markAllNotificationsRead } = useERP();
  const { state, dispatch } = useGlobalStore();
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const profileMenuItems = [
    {
      id: 'profile',
      label: 'My Account',
      icon: <User className="w-4 h-4" />,
      onClick: () => navigate('/settings'),
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: <SettingsIcon className="w-4 h-4" />,
      onClick: () => navigate('/settings'),
    },
    {
      id: 'logout',
      label: 'Sign Out Session',
      icon: <LogOut className="w-4 h-4" />,
      danger: true,
      onClick: () => {
        dispatch({ type: 'LOGOUT' });
        navigate('/login');
      },
    },
  ];

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Breadcrumbs Left */}
      <Breadcrumbs />

      {/* Action Controls Right */}
      <div className="flex items-center gap-3">
        {/* Global Search Trigger (Cmd+K) */}
        <button
          onClick={() => setGlobalSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-medium transition-colors border border-transparent hover:border-slate-300 dark:hover:border-slate-700"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Quick Search...</span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-400">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={markAllNotificationsRead}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            aria-label="View Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            )}
          </button>
        </div>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* User Profile Menu */}
        <Dropdown
          align="right"
          trigger={
            <div className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                {state.user?.firstName ? state.user.firstName[0] : 'A'}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                  {state.user?.firstName ? `${state.user.firstName} ${state.user.lastName}` : 'Administrator'}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">{state.user?.role || 'SYSTEM_ADMIN'}</span>
              </div>
            </div>
          }
          items={profileMenuItems}
        />
      </div>
    </header>
  );
};
