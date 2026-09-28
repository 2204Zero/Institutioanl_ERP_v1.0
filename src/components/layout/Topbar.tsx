import React, { useState } from 'react';
import {
  Search,
  Bell,
  Settings,
  HelpCircle,
  Globe,
  Sun,
  Moon,
  CheckCircle,
  X,
  User,
  ShieldCheck,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useERP } from '../../hooks/useERP';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';

export const Topbar: React.FC = () => {
  const {
    setGlobalSearchOpen,
    notifications,
    markAllNotificationsRead,
    openSettingsModal,
    addToast,
    activePath,
    modules,
  } = useERP();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const currentModule = modules.find((m) => m.path === activePath) || {
    name: 'Finance & Accounts',
    category: 'Enterprise',
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
    addToast(
      'Theme Shifted',
      !isDarkMode ? 'Switched to High-Contrast Night Mode.' : 'Switched to Enterprise Light Mode.',
      'info'
    );
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Left: Breadcrumbs & Quick Search Bar */}
      <div className="flex items-center gap-4">
        {/* Breadcrumb path */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="text-slate-400 font-semibold">{currentModule.category}</span>
          <span>/</span>
          <span className="text-slate-900 font-bold">{currentModule.name}</span>
          <span className="text-slate-300">|</span>
          <a
            href="/roles"
            className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 transition-colors"
            title="Switch User Role Persona"
          >
            Role: {localStorage.getItem('selectedRole') || 'Administrator'}
          </a>
        </div>

        {/* Global Search Command Bar Trigger */}
        <button
          onClick={() => setGlobalSearchOpen(true)}
          className="flex items-center gap-3 bg-slate-100/80 hover:bg-slate-200/60 border border-slate-200/80 text-slate-500 px-3 py-1.5 rounded-lg text-xs w-64 md:w-80 transition-all text-left shadow-2xs group"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 transition-colors" />
          <span className="flex-1 truncate">Search modules, students, ledgers...</span>
          <kbd className="hidden sm:inline-block bg-white text-slate-400 px-1.5 py-0.5 rounded border border-slate-300 text-[10px] font-mono shadow-2xs font-semibold">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Actions & User Menu */}
      <div className="flex items-center gap-2">
        {/* Language Switcher */}
        <button
          onClick={() => addToast('Language Updated', 'Locale set to English (IN - Academic Standard)', 'info')}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors hidden md:flex"
          title="System Language"
        >
          <Globe className="w-4 h-4 text-slate-400" />
          <span>EN (IN)</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
        >
          {isDarkMode ? <Sun className="w-4.5 h-4.5 text-amber-500" /> : <Moon className="w-4.5 h-4.5 text-slate-500" />}
        </button>

        {/* Notifications Popover Trigger */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen((prev) => !prev)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg relative transition-colors"
            title="System Alerts"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          <AnimatePresence>
            {isNotifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 overflow-hidden text-left"
              >
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900">System Notifications</h4>
                    {unreadCount > 0 && <Badge variant="warning">{unreadCount} New</Badge>}
                  </div>
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] font-semibold text-brand-600 hover:text-brand-700"
                  >
                    Mark All Read
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">No notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 text-xs flex items-start gap-3 hover:bg-slate-50 transition-colors ${
                          !n.read ? 'bg-brand-50/40' : ''
                        }`}
                      >
                        <div className="p-1.5 rounded-full bg-brand-100 text-brand-600 mt-0.5 shrink-0">
                          <CheckCircle className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 truncate">{n.title}</p>
                          <p className="text-slate-500 text-[11px] mt-0.5">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block font-mono">{n.time}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="px-4 py-2 border-t border-slate-100 text-center bg-slate-50">
                  <span className="text-[11px] font-semibold text-slate-600 hover:text-brand-600 cursor-pointer">
                    View Notification Archive →
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* System Settings Modal Trigger */}
        <button
          onClick={openSettingsModal}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          title="ERP Platform Preferences"
        >
          <Settings className="w-4.5 h-4.5" />
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200 mx-1" />

        {/* User Profile Dropdown Menu */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-100 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              RK
            </div>
            <div className="hidden lg:flex flex-col text-left leading-tight">
              <span className="text-xs font-bold text-slate-900">Dr. Rajesh Kumar</span>
              <span className="text-[10px] text-slate-500 font-medium">Dean of Academics</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 text-left"
              >
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">Dr. Rajesh Kumar</p>
                  <p className="text-[11px] text-slate-500">rajesh.kumar@nits.edu</p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      Super Administrator
                    </span>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      openSettingsModal();
                    }}
                    className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-medium"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    Profile & Security Settings
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      addToast('Help Docs', 'Opening Institutional ERP User Handbook', 'info');
                    }}
                    className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-medium"
                  >
                    <HelpCircle className="w-4 h-4 text-slate-400" />
                    User Guide & Support
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      addToast('Logged Out', 'User session terminated securely.', 'warning');
                    }}
                    className="w-full px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 font-bold"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    Sign Out Session
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
