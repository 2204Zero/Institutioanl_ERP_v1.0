import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../store/useAuthStore';
import { 
  LayoutDashboard, Users, GraduationCap, CalendarCheck, Wallet, 
  Building2, MapPin, Store, ShieldAlert, UserCheck, 
  Menu, X, LogOut, ChevronDown, UserCircle, Bell,
  BookOpen, FileText, Settings, Bus, FileSpreadsheet
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Badge } from './ui/badge';

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavItem = ({ path, icon: Icon, label, disabled = false, comingSoon = false }: { path: string, icon: React.ElementType, label: string, disabled?: boolean, comingSoon?: boolean }) => {
    const isActive = location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));
    
    if (disabled || comingSoon) {
      return (
        <div className="flex items-center justify-between px-3 py-2.5 rounded-md text-slate-400 cursor-not-allowed opacity-75">
          <div className="flex items-center space-x-3">
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{label}</span>
          </div>
          {comingSoon && <Badge variant="comingSoon">Soon</Badge>}
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
              <NavItem path="/dashboard/communications" icon={Bell} label="Communications" comingSoon />
            </NavGroup>

            <NavGroup title="Academics">
              <NavItem path="/dashboard/departments" icon={Store} label="Programs & Departments" />
              <NavItem path="/dashboard/academics" icon={GraduationCap} label="Course Catalog" />
              <NavItem path="/dashboard/examinations" icon={FileText} label="Examinations" comingSoon />
              <NavItem path="/dashboard/library" icon={BookOpen} label="Library Management" comingSoon />
            </NavGroup>

            <NavGroup title="Finance">
              <NavItem path="/dashboard/finance" icon={Wallet} label="Fee Management" />
              <NavItem path="/dashboard/scholarships" icon={FileSpreadsheet} label="Scholarships" comingSoon />
            </NavGroup>

            <NavGroup title="System Setup">
              <NavItem path="/dashboard/admin/users" icon={ShieldAlert} label="Access Control" />
              {role === 'SUPER_ADMIN' && (
                <>
                  <NavItem path="/dashboard/institutions" icon={Building2} label="Institution Config" />
                  <NavItem path="/dashboard/campuses" icon={MapPin} label="Campuses" />
                </>
              )}
              <NavItem path="/dashboard/infrastructure" icon={Bus} label="Infrastructure & Transport" comingSoon />
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
              <NavItem path="/dashboard/examinations" icon={FileText} label="Grading & Exams" comingSoon />
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
              <NavItem path="/dashboard/examinations" icon={FileText} label="My Results" comingSoon />
              <NavItem path="/dashboard/library" icon={BookOpen} label="Library Catalog" comingSoon />
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
              <NavItem path="/dashboard/examinations" icon={FileText} label="Ward Results" comingSoon />
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
              <NavItem path="/dashboard/scholarships" icon={FileSpreadsheet} label="Scholarships & Refunds" comingSoon />
            </NavGroup>
            
            <NavGroup title="Directory">
              <NavItem path="/dashboard/students" icon={Users} label="Student Lookup" />
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
            {/* Optional Notifications */}
            <button className="text-slate-400 hover:text-slate-600 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            {/* User Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
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
                      
                    </div>
                    <button className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center space-x-2">
                      <Settings className="w-4 h-4" />
                      <span>Account Settings</span>
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