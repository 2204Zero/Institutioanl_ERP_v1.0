import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, LayoutDashboard, Users, Store, Settings, HelpCircle, CalendarCheck, Wallet, Building2, MapPin, HeartHandshake, ShieldAlert, BookOpen, UserCheck, Key, Bell, ClipboardList, Briefcase, GraduationCap } from 'lucide-react';

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

  return (
    <div className="min-h-screen flex bg-[#f4f4f5] font-sans flex-col md:flex-row">
      {/* Solid Red Sidebar */}
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-black text-white p-4 z-20">
        <div className="flex items-center space-x-3">
          <img src="/logo.jpg?v=3" alt="EduPulse" className="w-8 h-8 rounded-md object-cover" />
          <span className="text-xl font-bold tracking-wide">EduPulse</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 transform ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 transition duration-200 ease-in-out w-64 bg-black text-white p-6 flex flex-col justify-between shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.1)] z-30`} >
        <div>
          <div className="flex items-center space-x-3 mb-10 text-white">
            <img src="/logo.jpg?v=3" alt="EduPulse" className="w-8 h-8 rounded-md object-cover" />
            <span className="text-xl font-bold tracking-wide">EduPulse</span>
          </div>

          <div className="h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
            <div className="text-xs font-semibold text-slate-500 mb-3 tracking-wider">MAIN</div>
            <nav className="space-y-1 mb-6">
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard" className={getLinkClass('/dashboard')}>
                <LayoutDashboard className="w-4 h-4" />
                <span className="text-sm">Dashboard</span>
              </Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/admissions" className={getLinkClass('/dashboard/admissions')}>
                <UserCheck className="w-4 h-4" />
                <span className="text-sm">Admissions</span>
              </Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/students" className={getLinkClass('/dashboard/students')}>
                <Users className="w-4 h-4" />
                <span className="text-sm">Students</span>
              </Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/academics" className={getLinkClass('/dashboard/academics')}>
                <GraduationCap className="w-4 h-4" />
                <span className="text-sm">Academics</span>
              </Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/attendance" className={getLinkClass('/dashboard/attendance')}>
                <CalendarCheck className="w-4 h-4" />
                <span className="text-sm">Attendance</span>
              </Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/finance" className={getLinkClass('/dashboard/finance')}>
                <Wallet className="w-4 h-4" />
                <span className="text-sm">Finance</span>
              </Link>
            </nav>

            <div className="text-xs font-semibold text-slate-500 mb-3 tracking-wider">ORGANIZATION</div>
            <nav className="space-y-1 mb-6">
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/institutions" className={getLinkClass('/dashboard/institutions')}>
                <Building2 className="w-4 h-4" />
                <span className="text-sm">Institutions</span>
              </Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/campuses" className={getLinkClass('/dashboard/campuses')}>
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Campuses</span>
              </Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/departments" className={getLinkClass('/dashboard/departments')}>
                <Store className="w-4 h-4" />
                <span className="text-sm">Departments</span>
              </Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/faculty" className={getLinkClass('/dashboard/faculty')}>
                <Briefcase className="w-4 h-4" />
                <span className="text-sm">Faculty & Staff</span>
              </Link>
            </nav>

            <div className="text-xs font-semibold text-slate-500 mb-3 tracking-wider">ADMINISTRATION</div>
            <nav className="space-y-1 mb-6">
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/admin/users" className={getLinkClass('/dashboard/admin/users')}>
                <ShieldAlert className="w-4 h-4" />
                <span className="text-sm">Users</span>
              </Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/roles" className={getLinkClass('/dashboard/roles')}>
                <Key className="w-4 h-4" />
                <span className="text-sm">Roles & Permissions</span>
              </Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/notifications" className={getLinkClass('/dashboard/notifications')}>
                <Bell className="w-4 h-4" />
                <span className="text-sm">Notifications</span>
              </Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/audit" className={getLinkClass('/dashboard/audit')}>
                <ClipboardList className="w-4 h-4" />
                <span className="text-sm">Audit Logs</span>
              </Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/settings" className={getLinkClass('/dashboard/settings')}>
                <Settings className="w-4 h-4" />
                <span className="text-sm">Settings</span>
              </Link>
            </nav>

            <div className="text-xs font-semibold text-slate-500 mb-3 tracking-wider">SUPPORT</div>
            <nav className="space-y-1">
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/help" className={getLinkClass('/dashboard/help')}>
                <HelpCircle className="w-4 h-4" />
                <span className="text-sm">Help</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* Upgrade / Profile */}
        <div>
          
          <div className="flex items-center justify-between px-2 cursor-pointer hover:bg-white/10 p-2 rounded-full transition-colors" onClick={() => { logout(); navigate('/login'); }}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black font-bold">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-bold text-white">{user?.username}</div>
                <div className="text-xs text-slate-400">{user?.role}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Light Content */}
      <div className="flex-1 overflow-y-auto h-[calc(100vh-72px)] md:h-screen relative">
         <Outlet />
      </div>
    </div>
  );
}



