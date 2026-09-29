import React from 'react';
import { cn } from '../../utils/cn';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export interface AlertProps {
  title: string;
  description?: string;
  variant?: 'info' | 'success' | 'warning' | 'danger';
  onClose?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({
  title,
  description,
  variant = 'info',
  onClose,
  className,
  children,
}) => {
  const variantIcons = {
    info: <Info className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />,
    danger: <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />,
  };

  const variantStyles = {
    info: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800/60 text-sky-900 dark:text-sky-200',
    success: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200',
    warning: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200',
    danger: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200',
  };

  return (
    <div
      role="alert"
      className={cn('p-4 rounded-xl border flex items-start gap-3 text-left transition-all', variantStyles[variant], className)}
    >
      {variantIcons[variant]}
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-bold leading-tight">{title}</h4>
        {description && <p className="text-[11px] opacity-90 mt-1 leading-relaxed">{description}</p>}
        {children && <div className="mt-2">{children}</div>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
