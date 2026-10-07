import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../../utils/cn';

export interface ErrorMessageProps {
  id?: string;
  message?: string;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = React.memo(({ id, message, className }) => {
  if (!message) return null;

  return (
    <span
      id={id}
      role="alert"
      aria-live="polite"
      className={cn('text-xs text-red-600 font-semibold flex items-center gap-1 mt-1 animate-in fade-in duration-150', className)}
    >
      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
      <span>{message}</span>
    </span>
  );
});

ErrorMessage.displayName = 'ErrorMessage';
