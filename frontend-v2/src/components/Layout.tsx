import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { 
  LayoutDashboard, Users, GraduationCap, CalendarCheck, Wallet, Settings, 
  Building2, MapPin, Store, Briefcase, ClipboardList, ShieldAlert, Key, 
  Bell, UserCheck, HelpCircle, Menu, X, BookOpen, CreditCard, User, History
} from 'lucide-react';

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));
    return `flex items-center space-x-3 px-4 py-3 rounded-full transition-colors ${
      isActive ? 'bg-white text-black font-bold shadow-lg shadow-white/10' : 'text-slate-400 hover:text-white hover:bg-white/10'
    }`;
  };

  const role = user?.role || '';

  const renderSidebarContent = () => {
    switch (role) {
      case 'SUPER_ADMIN':
        return (
          <>
            <div className="text-xs font-semibold text-slate-500 mb-3 tracking-wider">OVERVIEW</div>
            <nav className="space-y-1 mb-6">
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard" className={getLinkClass('/dashboard')}>
                <LayoutDashboard className="w-4 h-4" />
                <span className="text-sm">Dashboard</span>
              </Link>
            </nav>

            <div className="text-xs font-semibold text-slate-500 mb-3 tracking-wider">INSTITUTION</div>
            <nav className="space-y-1 mb-6">
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/institutions" className={getLinkClass('/dashboard/institutions')}><Building2 className="w-4 h-4" /><span className="text-sm">Institution</span></Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/campuses" className={getLinkClass('/dashboard/campuses')}><MapPin className="w-4 h-4" /><span className="text-sm">Campuses</span></Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/departments" className={getLinkClass('/dashboard/departments')}><Store className="w-4 h-4" /><span className="text-sm">Departments</span></Link>
            </nav>

            <div className="text-xs font-semibold text-slate-500 mb-3 tracking-wider">STUDENTS & ACADEMICS</div>
            <nav className="space-y-1 mb-6">
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/students" className={getLinkClass('/dashboard/students')}><Users className="w-4 h-4" /><span className="text-sm">Students</span></Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/admissions" className={getLinkClass('/dashboard/admissions')}><UserCheck className="w-4 h-4" /><span className="text-sm">Admissions</span></Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/academics" className={getLinkClass('/dashboard/academics')}><GraduationCap className="w-4 h-4" /><span className="text-sm">Academics</span></Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/attendance" className={getLinkClass('/dashboard/attendance')}><CalendarCheck className="w-4 h-4" /><span className="text-sm">Attendance</span></Link>
            </nav>

            <div className="text-xs font-semibold text-slate-500 mb-3 tracking-wider">FINANCE</div>
            <nav className="space-y-1 mb-6">
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/finance" className={getLinkClass('/dashboard/finance')}><Wallet className="w-4 h-4" /><span className="text-sm">Fees & Invoices</span></Link>
            </nav>

            <div className="text-xs font-semibold text-slate-500 mb-3 tracking-wider">SYSTEM & ADMIN</div>
            <nav className="space-y-1 mb-6">
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/admin/users" className={getLinkClass('/dashboard/admin/users')}><ShieldAlert className="w-4 h-4" /><span className="text-sm">Users</span></Link>
              </nav>
          </>
        );

      case 'ADMIN':
        return (
          <>
            <div className="text-xs font-semibold text-slate-500 mb-3 tracking-wider">OVERVIEW</div>
            <nav className="space-y-1 mb-6">
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard" className={getLinkClass('/dashboard')}>
                <LayoutDashboard className="w-4 h-4" />
                <span className="text-sm">Dashboard</span>
              </Link>
            </nav>

            <div className="text-xs font-semibold text-slate-500 mb-3 tracking-wider">INSTITUTION</div>
            <nav className="space-y-1 mb-6">
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/institutions" className={getLinkClass('/dashboard/institutions')}><Building2 className="w-4 h-4" /><span className="text-sm">Institution</span></Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/campuses" className={getLinkClass('/dashboard/campuses')}><MapPin className="w-4 h-4" /><span className="text-sm">Campuses</span></Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/departments" className={getLinkClass('/dashboard/departments')}><Store className="w-4 h-4" /><span className="text-sm">Departments</span></Link>
            </nav>

            <div className="text-xs font-semibold text-slate-500 mb-3 tracking-wider">OPERATIONS</div>
            <nav className="space-y-1 mb-6">
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/students" className={getLinkClass('/dashboard/students')}><Users className="w-4 h-4" /><span className="text-sm">Students</span></Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/admin/users" className={getLinkClass('/dashboard/admin/users')}><ShieldAlert className="w-4 h-4" /><span className="text-sm">Users</span></Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/attendance" className={getLinkClass('/dashboard/attendance')}><CalendarCheck className="w-4 h-4" /><span className="text-sm">Attendance Overview</span></Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/finance" className={getLinkClass('/dashboard/finance')}><Wallet className="w-4 h-4" /><span className="text-sm">Fee Records</span></Link>
            </nav>
          </>
        );

      case 'FACULTY':
        return (
          <>
            <div className="text-xs font-semibold text-slate-500 mb-3 tracking-wider">ACADEMICS</div>
            <nav className="space-y-1 mb-6">
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard" className={getLinkClass('/dashboard')}>
                <LayoutDashboard className="w-4 h-4" />
                <span className="text-sm">Dashboard</span>
              </Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/students" className={getLinkClass('/dashboard/students')}><Users className="w-4 h-4" /><span className="text-sm">Students</span></Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/attendance" className={getLinkClass('/dashboard/attendance')}><CalendarCheck className="w-4 h-4" /><span className="text-sm">Attendance</span></Link>
            </nav>
          </>
        );

      case 'STUDENT':
        return (
          <>
            <div className="text-xs font-semibold text-slate-500 mb-3 tracking-wider">MY PORTAL</div>
            <nav className="space-y-1 mb-6">
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard" className={getLinkClass('/dashboard')}>
                <LayoutDashboard className="w-4 h-4" />
                <span className="text-sm">Dashboard</span>
              </Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/attendance" className={getLinkClass('/dashboard/attendance')}><CalendarCheck className="w-4 h-4" /><span className="text-sm">My Attendance</span></Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/finance" className={getLinkClass('/dashboard/finance')}><Wallet className="w-4 h-4" /><span className="text-sm">My Fees</span></Link>
              </nav>
          </>
        );

      case 'PARENT':
        return (
          <>
            <div className="text-xs font-semibold text-slate-500 mb-3 tracking-wider">WARD PORTAL</div>
            <nav className="space-y-1 mb-6">
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard" className={getLinkClass('/dashboard')}>
                <LayoutDashboard className="w-4 h-4" />
                <span className="text-sm">Dashboard</span>
              </Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/attendance" className={getLinkClass('/dashboard/attendance')}><CalendarCheck className="w-4 h-4" /><span className="text-sm">Ward Attendance</span></Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/finance" className={getLinkClass('/dashboard/finance')}><Wallet className="w-4 h-4" /><span className="text-sm">Ward Fees</span></Link>
              </nav>
          </>
        );

      case 'FINANCE':
        return (
          <>
            <div className="text-xs font-semibold text-slate-500 mb-3 tracking-wider">FINANCE PORTAL</div>
            <nav className="space-y-1 mb-6">
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard" className={getLinkClass('/dashboard')}>
                <LayoutDashboard className="w-4 h-4" />
                <span className="text-sm">Dashboard</span>
              </Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/finance" className={getLinkClass('/dashboard/finance')}><Wallet className="w-4 h-4" /><span className="text-sm">Finance Management</span></Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/students" className={getLinkClass('/dashboard/students')}><Users className="w-4 h-4" /><span className="text-sm">Students</span></Link>
            </nav>
          </>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f4f4f5] font-sans flex-col md:flex-row">
      <div className="md:hidden flex items-center justify-between bg-black text-white p-4 z-20">
        <div className="flex items-center space-x-3">
          <img src="/logo.jpg?v=3" alt="EduPulse" className="w-8 h-8 rounded-md object-cover" />
          <span className="text-xl font-bold tracking-wide">EduPulse</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <div className={`fixed inset-y-0 left-0 transform ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 transition duration-200 ease-in-out w-64 bg-black text-white p-6 flex flex-col justify-between shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.1)] z-30`} >
        <div>
          <div className="flex items-center space-x-3 mb-10 text-white">
            <img src="/logo.jpg?v=3" alt="EduPulse" className="w-8 h-8 rounded-md object-cover" />
            <span className="text-xl font-bold tracking-wide">EduPulse</span>
          </div>

          <div className="h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
            {renderSidebarContent()}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between px-2 cursor-pointer hover:bg-white/10 p-2 rounded-full transition-colors" onClick={() => { logout(); navigate('/login'); }}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black font-bold">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <div className="text-sm font-bold text-white">{user?.username || 'User'}</div>
                <div className="text-xs text-slate-400">{user?.role || 'Guest'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto h-[calc(100vh-72px)] md:h-screen relative">
         <Outlet />
      </div>
    </div>
  );
}

