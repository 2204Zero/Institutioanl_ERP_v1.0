import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, GraduationCap, UserCheck, Users, Lock, Mail, ArrowLeft, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';
import { useGlobalStore } from '../store/StoreContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ThemeToggle } from '../components/layout/ThemeToggle';

export const LoginPage: React.FC = () => {
  const { role = 'student' } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const { dispatch } = useGlobalStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const roleConfigs: Record<string, { title: string; subtitle: string; icon: React.ReactNode; defaultEmail: string }> = {
    student: {
      title: 'Student Portal Login',
      subtitle: 'Enter your institutional credentials to access your academic dashboard.',
      icon: <GraduationCap className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
      defaultEmail: 'student@nits.ac.in',
    },
    faculty: {
      title: 'Faculty Portal Login',
      subtitle: 'Access course schedules, student grading, and attendance records.',
      icon: <UserCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />,
      defaultEmail: 'faculty@nits.ac.in',
    },
    parent: {
      title: 'Parent Portal Login',
      subtitle: 'Monitor ward progress, view fee invoices, and track performance.',
      icon: <Users className="w-8 h-8 text-amber-600 dark:text-amber-400" />,
      defaultEmail: 'parent@nits.ac.in',
    },
    admin: {
      title: 'Administrator Login',
      subtitle: 'High-privilege portal for system configuration and user management.',
      icon: <ShieldCheck className="w-8 h-8 text-purple-600 dark:text-purple-400" />,
      defaultEmail: 'admin@nits.ac.in',
    },
  };

  const currentRole = roleConfigs[role.toLowerCase()] || roleConfigs.student;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const response = await authService.login({ email, password });
      if (response.success && response.data) {
        dispatch({
          type: 'SET_AUTH',
          payload: {
            user: response.data.user,
            tokens: {
              accessToken: response.data.accessToken,
              refreshToken: response.data.refreshToken,
              tokenType: response.data.tokenType,
              expiresIn: response.data.expiresIn,
              issuedAt: Date.now(),
            },
          },
        });
        navigate('/dashboard');
      } else {
        setErrorMessage(response.error?.message || 'Invalid email or password credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication request failed. Please check network connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between p-6 relative">
      <header className="flex items-center justify-between max-w-5xl w-full mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Role Selection
        </button>
        <ThemeToggle />
      </header>

      <main className="max-w-md w-full mx-auto my-12">
        <Card className="p-8 shadow-xl border border-slate-200 dark:border-slate-800">
          <div className="text-center space-y-3 mb-6">
            <div className="inline-flex p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-2">
              {currentRole.icon}
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{currentRole.title}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{currentRole.subtitle}</p>
          </div>

          {errorMessage && (
            <div className="p-3 mb-6 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Institutional Email Address
              </label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={currentRole.defaultEmail}
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Account Password
              </label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              />
            </div>

            <Button type="submit" variant="primary" className="w-full py-2.5 mt-2" isLoading={isLoading}>
              Sign In to {role.toUpperCase()} Portal
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400">
            Protected by Spring Security JWT OAuth2 Protocol
          </div>
        </Card>
      </main>

      <footer className="text-center text-xs text-slate-400 dark:text-slate-600">
        &copy; {new Date().getFullYear()} Institutional ERP System
      </footer>
    </div>
  );
};
