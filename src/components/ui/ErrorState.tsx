import React from 'react';
import { AlertOctagon } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Application Error Encountered',
  description = 'An unexpected failure occurred while communicating with the ERP service.',
  onRetry,
}) => {
  return (
    <div className="p-8 text-center flex flex-col items-center justify-center bg-rose-50/50 rounded-2xl border border-rose-100">
      <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
        <AlertOctagon className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-bold text-slate-800">{title}</h4>
      <p className="text-xs text-slate-600 max-w-sm mt-1 mb-4">{description}</p>
      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry}>
          Retry Action
        </Button>
      )}
    </div>
  );
};
