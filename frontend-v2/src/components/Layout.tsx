import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../store/useAuthStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../config/api';
import { 
  LayoutDashboard, Users, GraduationCap, CalendarCheck, Wallet, 
  Store, ShieldAlert, UserCheck, 
  Menu, X, LogOut, ChevronDown, UserCircle, Bell,
  Check, KeyRound
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ChangePasswordModal } from './ChangePasswordModal';

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); toast.success('Connection restored.'); };
    const handleOffline = () => { setIsOnline(false); toast.error('You are currently offline.'); };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const { data: unreadData } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: async () => {
      try {
        const res = await apiClient.get<{ unreadCount: number }>('/api/v1/notifications/unread-count');
        return res.data;
      } catch {
        return { unreadCount: 0 };
      }
    },
    refetchInterval: 15000,
  });

  const { data: notifications = [], isLoading: isLoadingNotifs } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await apiClient.get<any[]>('/api/v1/notifications');
      return res.data;
    },
    enabled: isNotificationsOpen,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient.patch(`/api/v1/notifications/${id}/read`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.patch('/api/v1/notifications/mark-all-read');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const handleLogout = () => {
    const isApplicant = user?.role === 'APPLICANT';
    logout();
    if (isApplicant) {
      navigate('/login?tab=applicant');
    } else {
      navigate('/login');
    }
  };

  const NavItem = ({ path, icon: Icon, label, disabled = false }: { path: string, icon: React.ElementType, label: string, disabled?: boolean }) => {
    const isActive = location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));
    
    if (disabled) {
      return (
        <div className="flex items-center justify-between px-3 py-2.5 rounded-md text-slate-400 cursor-not-allowed opacity-75">
          <div className="flex items-center space-x-3">
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{label}</span>
          </div>
        </div>
      );
    }

    return (
      <Link 
        onClick={() => setIsMobileMenuOpen(false)} 
        to={path} 
        className={cn(
          "flex items-center justify-between px-3 py-2.5 rounded-md transition-colors",
          isActive 
            ? "bg-primary/10 text-primary font-semibold" 
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium"
        )}
      >
        <div className="flex items-center space-x-3">
          <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-slate-500")} />
          <span className="text-sm">{label}</span>
        </div>
      </Link>
    );
  };

  const NavGroup = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="mb-6">
      <div className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{title}</div>
      <nav className="space-y-0.5">{children}</nav>
    </div>
  );

  const role = user?.role || '';

  const renderSidebarContent = () => {
    switch (role) {
      case 'SUPER_ADMIN':
      case 'ADMIN':
        return (
          <>
            <NavGroup title="Admin Portal">
              <NavItem path="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            </NavGroup>

            <NavGroup title="Operations">
              <NavItem path="/dashboard/students" icon={Users} label="Students Directory" />
              <NavItem path="/dashboard/admissions" icon={UserCheck} label="Admissions" />
              <NavItem path="/dashboard/attendance" icon={CalendarCheck} label="Attendance Oversight" />
            </NavGroup>

            <NavGroup title="Academics">
              <NavItem path="/dashboard/departments" icon={Store} label="Programs & Departments" />
              <NavItem path="/dashboard/academics" icon={GraduationCap} label="Course Catalog" />
            </NavGroup>

            <NavGroup title="Finance">
              <NavItem path="/dashboard/finance" icon={Wallet} label="Fee Management" />
            </NavGroup>

            <NavGroup title="System Setup">
              <NavItem path="/dashboard/admin/users" icon={ShieldAlert} label="Access Control" />
            </NavGroup>
          </>
        );

      case 'FACULTY':
        return (
          <>
            <NavGroup title="Faculty Portal">
              <NavItem path="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            </NavGroup>
            
            <NavGroup title="Academics">
              <NavItem path="/dashboard/academics" icon={GraduationCap} label="My Timetable" />
              <NavItem path="/dashboard/sections" icon={Users} label="My Sections" />
            </NavGroup>
            
            <NavGroup title="Classroom">
              <NavItem path="/dashboard/attendance" icon={CalendarCheck} label="Take Attendance" />
            </NavGroup>
          </>
        );

      case 'STUDENT':
        return (
          <>
            <NavGroup title="Self-Service Portal">
              <NavItem path="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            </NavGroup>
            
            <NavGroup title="Academics">
              <NavItem path="/dashboard/attendance" icon={CalendarCheck} label="My Attendance" />
            </NavGroup>

            <NavGroup title="Finance">
              <NavItem path="/dashboard/finance" icon={Wallet} label="My Invoices" />
            </NavGroup>
          </>
        );

      case 'PARENT':
        return (
          <>
            <NavGroup title="Ward Portal">
              <NavItem path="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            </NavGroup>
            
            <NavGroup title="Academics">
              <NavItem path="/dashboard/attendance" icon={CalendarCheck} label="Ward Attendance" />
            </NavGroup>
            
            <NavGroup title="Finance">
              <NavItem path="/dashboard/finance" icon={Wallet} label="Ward Fees" />
            </NavGroup>
          </>
        );

      case 'FINANCE':
        return (
          <>
            <NavGroup title="Finance Portal">
              <NavItem path="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            </NavGroup>
            
            <NavGroup title="Receivables">
              <NavItem path="/dashboard/finance" icon={Wallet} label="Fee Management" />
            </NavGroup>
            
            <NavGroup title="Directory">
              <NavItem path="/dashboard/students" icon={Users} label="Student Lookup" />
            </NavGroup>
          </>
        );

      case 'APPLICANT':
        return (
          <>
            <NavGroup title="Applicant Portal">
              <NavItem path="/dashboard" icon={LayoutDashboard} label="My Application" />
              <NavItem path="/admissions" icon={GraduationCap} label="Admissions Catalog" />
            </NavGroup>
          </>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      
      {/* Mobile Header Overlay */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center space-x-2">
          <img src="/logo.jpg" alt="EduPulse Logo" className="w-8 h-8 rounded shadow-sm border border-slate-200" />
          <span className="font-bold text-slate-900 tracking-tight text-lg">EduPulse ERP</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-md">
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-30 w-72 bg-white border-r border-slate-200 shadow-sm flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-slate-200 hidden md:flex items-center space-x-3">
          <img src="/logo.jpg" alt="EduPulse Logo" className="w-10 h-10 rounded-md shadow-sm border border-slate-200" />
          <div>
            <h1 className="font-extrabold text-slate-900 tracking-tight text-xl leading-none uppercase">EduPulse</h1>
            <p className="text-[10px] text-slate-500 mt-1 font-bold tracking-widest uppercase">Enterprise V1.0</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {renderSidebarContent()}
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-3 px-3">
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold uppercase shrink-0">
              {user?.username?.charAt(0) || user?.role?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user?.username || 'User'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Desktop Header */}
        <header className="hidden md:flex h-16 bg-white border-b border-slate-200 items-center justify-between px-8 sticky top-0 z-10 shrink-0">
          <div className="flex items-center">
            {/* Left side context - reserved for breadcrumbs or title injected by pages */}
            {!isOnline && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Offline Mode
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Real Notifications Dropdown */}
            <div className="relative">
              <button 
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsProfileOpen(false);
                }}
                className="text-slate-500 hover:text-slate-800 transition-colors relative p-1.5 rounded-full hover:bg-slate-100 focus:outline-none"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadData && unreadData.unreadCount > 0 ? (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {unreadData.unreadCount > 9 ? '9+' : unreadData.unreadCount}
                  </span>
                ) : null}
              </button>

              {isNotificationsOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsNotificationsOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-20 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-slate-900">Notifications</span>
                        {unreadData && unreadData.unreadCount > 0 && (
                          <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {unreadData.unreadCount} unread
                          </span>
                        )}
                      </div>
                      {unreadData && unreadData.unreadCount > 0 ? (
                        <button
                          onClick={() => markAllReadMutation.mutate()}
                          disabled={markAllReadMutation.isPending}
                          className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer hover:underline disabled:opacity-50"
                        >
                          Mark all as read
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">EduPulse Alerts</span>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {isLoadingNotifs ? (
                        <div className="p-6 text-center text-xs text-slate-400">Loading notifications...</div>
                      ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-500 space-y-1">
                          <p className="font-semibold text-slate-700">All caught up!</p>
                          <p className="text-slate-400">No new alerts or system notices.</p>
                        </div>
                      ) : (
                        notifications.map((n: any) => (
                          <div 
                            key={n.id} 
                            className={cn(
                              "p-3.5 flex items-start justify-between gap-3 transition-colors",
                              n.read ? "bg-white opacity-75" : "bg-blue-50/40"
                            )}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={cn(
                                  "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
                                  n.type === 'ERROR' || n.type === 'WARNING' ? "bg-amber-100 text-amber-800" :
                                  n.type === 'SUCCESS' ? "bg-emerald-100 text-emerald-800" :
                                  "bg-slate-100 text-slate-700"
                                )}>
                                  {n.type || 'INFO'}
                                </span>
                                <h4 className="text-xs font-bold text-slate-900 truncate">{n.title}</h4>
                              </div>
                              <p className="text-xs text-slate-600 line-clamp-2">{n.message}</p>
                              {n.link && (
                                <Link
                                  to={n.link}
                                  onClick={() => {
                                    if (!n.read) markReadMutation.mutate(n.id);
                                    setIsNotificationsOpen(false);
                                  }}
                                  className="inline-flex items-center text-[11px] text-blue-600 hover:text-blue-800 font-semibold mt-1.5 hover:underline"
                                >
                                  Open workflow &rarr;
                                </Link>
                              )}
                              {n.createdAt && (
                                <p className="text-[10px] text-slate-400 mt-1">
                                  {new Date(n.createdAt).toLocaleString(undefined, {
                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                  })}
                                </p>
                              )}
                            </div>
                            {!n.read && (
                              <button
                                onClick={() => markReadMutation.mutate(n.id)}
                                disabled={markReadMutation.isPending}
                                className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-100/60 p-1 rounded font-medium shrink-0"
                                title="Mark as read"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* User Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotificationsOpen(false);
                }}
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 focus:outline-none"
              >
                <UserCircle className="w-6 h-6" />
                <span className="text-sm font-medium">{user?.username}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-slate-200 z-20 py-1 overflow-hidden">
                    <div className="px-4 py-2 border-b border-slate-100 mb-1">
                      <p className="text-sm font-semibold text-slate-900">{user?.username}</p>
                      <p className="text-xs text-slate-500">{user?.role?.replace('_', ' ')}</p>
                    </div>
                    <button 
                      onClick={() => {
                        setIsProfileOpen(false);
                        setIsChangePasswordOpen(true);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2 border-b border-slate-100"
                    >
                      <KeyRound className="w-4 h-4 text-slate-500" />
                      <span>Change Password</span>
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
            <ChangePasswordModal 
              isOpen={isChangePasswordOpen} 
              onClose={() => setIsChangePasswordOpen(false)} 
            />
          </div>
        </header>

        {/* Mobile menu backdrop */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/50 z-20 md:hidden" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Outlet */}
        <main className="flex-1 overflow-y-auto bg-slate-50 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}