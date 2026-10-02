import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-6 shadow-lg">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <span className="px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-semibold mb-3">
        Error Code 403
      </span>
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">Access Forbidden</h1>
      <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mb-8">
        Your current user role does not possess the requisite RBAC permissions to access this institutional resource.
      </p>

      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
        <Button variant="primary" onClick={() => navigate('/dashboard')}>
          <Home className="w-4 h-4 mr-2" />
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};
