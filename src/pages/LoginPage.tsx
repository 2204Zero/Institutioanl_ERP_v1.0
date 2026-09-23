import React, { useState } from 'react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  Building2,
  ShieldCheck,
  AlertCircle,
  Server,
  Zap,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuthentication } from '../hooks/useAuthentication';
import { API_CONFIG } from '../config/apiConfig';

export interface LoginPageProps {
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { login, isAuthenticating, loginError, clearLoginError } = useAuthentication();

  const [username, setUsername] = useState('user');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearLoginError();

    if (!username.trim()) {
      setFormError('Institutional Username is required.');
      return;
    }
    if (!password.trim()) {
      setFormError('Account Password is required.');
      return;
    }

    const result = await login({
      username: username.trim(),
      password: password.trim(),
      rememberMe,
    });

    if (result.success && onSuccess) {
      onSuccess();
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setFormError(null);
    clearLoginError();
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden text-left">
      {/* Background Decorative Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        {/* Institutional Branding Card Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-600 text-white shadow-xl shadow-brand-500/25 mb-3">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Institutional ERP System
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Centralized Authentication & JWT Security Gateway
          </p>

          {/* Backend Status Pill */}
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-800/80 border border-slate-700 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Server className="w-3 h-3 text-brand-400 ml-0.5" />
            <span>Target: Spring Boot REST API (:8080)</span>
          </div>
        </div>

        {/* Main Login Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
          <div className="mb-5 pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Sign In to Workspace</h2>
              <p className="text-xs text-slate-500">Enter your official institutional credentials</p>
            </div>
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>

          {/* Error Banner */}
          {(formError || loginError) && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Authentication Failed:</span>{' '}
                <span>{formError || loginError}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username / ID"
              placeholder="e.g. user"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
              autoComplete="username"
              required
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="e.g. password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 focus:outline-none p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                autoComplete="current-password"
                required
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-3.5 h-3.5"
                />
                Remember this device
              </label>

              <button
                type="button"
                className="text-brand-600 hover:text-brand-700 font-bold hover:underline"
                onClick={() => handleQuickFill('user', 'password')}
              >
                Auto-Fill Defaults
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center text-xs py-2.5 font-bold shadow-md shadow-brand-500/20 mt-2"
              isLoading={isAuthenticating}
            >
              {isAuthenticating ? 'Authenticating with Backend...' : 'Authenticate & Enter Suite'}
            </Button>
          </form>

          {/* Quick-Fill Demo Credentials Selector */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Quick-Fill Backend Test Accounts</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('user', 'password')}
                className="p-2.5 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50/50 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 group-hover:text-brand-600">
                    Live Spring Boot
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1 rounded">
                    Active
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  <span className="font-mono">user</span> / <span className="font-mono">password</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('admin.rajesh', 'admin123')}
                className="p-2.5 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50/50 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 group-hover:text-brand-600">
                    Dean / Admin
                  </span>
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1 rounded">
                    Demo
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  <span className="font-mono">admin.rajesh</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-slate-400 font-medium">
          Protected by Spring Security JWT Stateless Filter · Educational ERP v{API_CONFIG.DEFAULT_HEADERS['X-Client-Version']}
        </div>
      </div>
    </div>
  );
};
