import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { User, Mail, Lock, Building2, Sun, Moon, ArrowRight, AlertCircle } from 'lucide-react';

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, loginWithGoogle, isLoading } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [agree, setAgree] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!fullName || !username || !email || !password) {
      setErrorMsg('Please complete all required registration fields.');
      return;
    }

    try {
      const res = await signUp({
        fullName,
        username,
        email,
        password,
        department,
        agreeToTerms: agree,
      });

      if (res.success) {
        navigate('/finance');
      } else {
        setErrorMsg(res.message || 'Account creation failed');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Server registration error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="absolute top-6 right-6">
        <button
          onClick={toggleTheme}
          className="p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors"
          title="Toggle Theme"
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600" />
          )}
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 dark:from-purple-600 dark:to-blue-500 flex items-center justify-center text-white font-black text-base shadow-md">
            ERP
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
            Institutional Suite
          </span>
        </Link>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Create Account
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Register for student or faculty ERP portal access
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-[#111827] py-8 px-6 sm:px-10 shadow-xl rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 text-left">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Dr. Aarav Sharma"
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/60 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 dark:focus:ring-purple-500 outline-none transition-all"
                  required
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 text-left">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="aarav.sharma"
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/60 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 dark:focus:ring-purple-500 outline-none transition-all"
                  required
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 text-left">
                Institutional Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aarav@institution.edu"
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/60 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 dark:focus:ring-purple-500 outline-none transition-all"
                  required
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 text-left">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/60 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 dark:focus:ring-purple-500 outline-none transition-all"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 text-left">
                Department
              </label>
              <div className="relative">
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/60 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 dark:focus:ring-purple-500 outline-none transition-all"
                >
                  <option value="Computer Science">Computer Science & Engineering</option>
                  <option value="Electronics">Electronics & Communication</option>
                  <option value="Mechanical">Mechanical Engineering</option>
                  <option value="Civil">Civil Engineering</option>
                  <option value="Finance">Finance & Accounts</option>
                </select>
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <label className="flex items-start gap-2 cursor-pointer pt-1 text-left">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-0.5 w-3.5 h-3.5 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
              />
              <span className="text-[11px] text-slate-600 dark:text-slate-400">
                I agree to the Institutional IT Policy and Terms of Access.
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading || !agree}
              className="w-full py-2.5 px-4 bg-brand-600 dark:bg-purple-600 hover:bg-brand-700 dark:hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Create Institutional Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Already registered?{' '}
            </span>
            <Link
              to="/login"
              className="text-xs font-bold text-brand-600 dark:text-purple-400 hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
