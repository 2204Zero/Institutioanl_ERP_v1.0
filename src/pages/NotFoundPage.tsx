import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 shadow-lg">
        <FileQuestion className="w-8 h-8" />
      </div>
      <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-3">
        Error Code 404
      </span>
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">Page Not Found</h1>
      <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mb-8">
        The requested URL path does not exist on this institutional server or has been relocated to another workspace.
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
