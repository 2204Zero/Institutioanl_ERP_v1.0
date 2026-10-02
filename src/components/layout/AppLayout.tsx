import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { GlobalSearchModal } from './GlobalSearchModal';
import { useERP } from '../../hooks/useERP';
import { Toast } from '../ui/Toast';
import { cn } from '../../utils/cn';

export const AppLayout: React.FC = () => {
  const { isSidebarCollapsed, toasts, removeToast } = useERP();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Workspace Container */}
      <div
        className={cn(
          'flex-1 flex flex-col transition-all duration-300 min-h-screen',
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        )}
      >
        <Topbar />
        
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          <Outlet />
        </main>
      </div>

      {/* Global Command Palette */}
      <GlobalSearchModal />

      {/* Toast Notification Queue */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              id={toast.id}
              title={toast.title}
              description={toast.description}
              type={toast.type}
              onClose={removeToast}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
