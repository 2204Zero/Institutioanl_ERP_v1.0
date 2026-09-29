import React from 'react';
import { cn } from '../../utils/cn';
import { X } from 'lucide-react';

export interface TagProps {
  children: React.ReactNode;
  variant?: 'default' | 'brand' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
  onDismiss?: () => void;
  className?: string;
}

export const Tag: React.FC<TagProps> = ({
  children,
  variant = 'default',
  size = 'md',
  onDismiss,
  className,
}) => {
  const variantStyles = {
    default: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    brand: 'bg-brand-50 dark:bg-purple-950/50 text-brand-700 dark:text-purple-300 border-brand-200 dark:border-purple-800',
    success: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    warning: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    danger: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border transition-all',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      <span>{children}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="hover:opacity-80 p-0.5 rounded focus:outline-none focus:ring-1 focus:ring-slate-400"
          aria-label="Remove tag"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};
