import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { MailCheck, CheckCircle2 } from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const { verifyEmail, isLoading } = useAuth();
  const [code, setCode] = useState('');
  const [verified, setVerified] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await verifyEmail({ email: 'user@institution.edu', code });
    if (res.success) {
      setVerified(true);
      setTimeout(() => navigate('/finance'), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-purple-950/60 text-brand-600 dark:text-purple-400 flex items-center justify-center mx-auto shadow-md">
          <MailCheck className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Verify Institutional Email
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Enter the 6-digit verification code sent to your inbox
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-[#111827] py-8 px-6 sm:px-10 shadow-xl rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-5">
          {verified ? (
            <div className="text-center space-y-3 py-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Email verified! Accessing workspace...
              </p>
            </div>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 text-left">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full text-center tracking-widest text-lg font-mono py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || code.length < 6}
                className="w-full py-2.5 px-4 bg-brand-600 dark:bg-purple-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {isLoading ? 'Verifying Code...' : 'Verify Email Address'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
