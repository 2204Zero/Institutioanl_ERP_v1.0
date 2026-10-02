import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ServerCrash, RefreshCw, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const ServerErrorPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6 shadow-lg">
        <ServerCrash className="w-8 h-8" />
      </div>
      <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-xs font-semibold mb-3">
        Error Code 500
      </span>
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">Internal Server Error</h1>
      <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mb-8">
        An unexpected backend service exception occurred. The system administrator has been notified.
      </p>

      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Reload Application
        </Button>
        <Button variant="primary" onClick={() => navigate('/dashboard')}>
          <Home className="w-4 h-4 mr-2" />
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};
