import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowRight,
  Sparkles,
  BarChart3,
  Users,
  Building2,
  Lock,
  Globe,
  Sun,
  Moon,
  CheckCircle2,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { isAuthenticated, loginWithGoogle } = useAuth();

  const handleDemoLogin = async () => {
    await loginWithGoogle();
    navigate('/finance');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 dark:from-purple-600 dark:to-blue-500 flex items-center justify-center text-white font-black text-sm shadow-md">
            ERP
          </div>
          <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
            Institutional Suite
          </span>
          <span className="hidden sm:inline-block bg-brand-50 dark:bg-purple-950/60 text-brand-700 dark:text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-brand-200 dark:border-purple-800">
            v2.4 Enterprise
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Toggle Theme"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-4.5 h-4.5 text-amber-400" />
            ) : (
              <Moon className="w-4.5 h-4.5 text-slate-600" />
            )}
          </button>

          {isAuthenticated ? (
            <Link
              to="/finance"
              className="px-4 py-2 text-xs font-bold text-white bg-brand-600 dark:bg-purple-600 hover:bg-brand-700 dark:hover:bg-purple-700 rounded-lg shadow-sm transition-all flex items-center gap-2"
            >
              <span>Go to Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 text-xs font-bold text-white bg-brand-600 dark:bg-purple-600 hover:bg-brand-700 dark:hover:bg-purple-700 rounded-lg shadow-sm transition-all hidden sm:inline-block"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-20 md:py-28 max-w-6xl mx-auto text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 bg-brand-50 dark:bg-purple-950/40 border border-brand-200 dark:border-purple-800/60 px-3.5 py-1.5 rounded-full text-xs font-semibold text-brand-700 dark:text-purple-300"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-purple-400" />
          <span>Next-Generation Educational Operating System</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-6xl font-black text-slate-950 dark:text-white tracking-tight leading-none"
        >
          Modern Enterprise ERP for <br />
          <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 dark:from-purple-400 dark:via-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
            Higher Education Excellence
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-slate-600 dark:text-slate-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed"
        >
          Unify tuition collections, student ledgers, academic registries, faculty payroll, and compliance audits with a high-performance, accessible, and responsive ERP platform.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 pt-4"
        >
          <Link
            to="/login"
            className="px-6 py-3 text-sm font-bold text-white bg-brand-600 dark:bg-purple-600 hover:bg-brand-700 dark:hover:bg-purple-700 rounded-xl shadow-lg shadow-brand-500/20 dark:shadow-purple-900/30 transition-all flex items-center gap-2"
          >
            <span>Launch Institutional Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={handleDemoLogin}
            className="px-6 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all shadow-xs flex items-center gap-2"
          >
            <span>Instant Demo Preview</span>
          </button>
        </motion.div>
      </section>

      {/* Feature Grid */}
      <section className="px-6 py-16 max-w-6xl mx-auto border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-purple-950/60 text-brand-600 dark:text-purple-400 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Real-time Financial Analytics</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
              Monitor tuition receipts, fee dues, research grant disbursements, and auxiliary revenue with Recharts visualizations.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Spring Security & JWT</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
              Encrypted token persistence, role-based access control (RBAC), and 401 silent token refresh queues.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">250+ ERP Modules Ready</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
              Scalable modular structure covering Finance, SIS, HR, Payroll, Library, Transport, Hostel, and Academics.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800 py-8 px-6 text-center text-xs text-slate-400 dark:text-slate-500">
        <p>© 2026 Institutional ERP Suite. Production Enterprise Architecture v2.4.0.</p>
      </footer>
    </div>
  );
};
