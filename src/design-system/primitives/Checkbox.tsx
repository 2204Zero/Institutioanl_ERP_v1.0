import React, { useId } from 'react';
import { cn } from '../../utils/cn';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, disabled, checked, onChange, ...props }, ref) => {
    const id = useId();

    return (
      <div className="flex items-start gap-3 select-none">
        <div className="relative flex items-center h-5 mt-0.5">
          <input
            id={id}
            type="checkbox"
            ref={ref}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className={cn(
              'peer h-4 w-4 shrink-0 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'checked:bg-brand-600 checked:border-brand-600 dark:checked:bg-purple-600 dark:checked:border-purple-600 text-white',
              'transition-all duration-150 cursor-pointer',
              error && 'border-rose-500 focus-visible:ring-rose-500',
              className
            )}
            {...props}
          />
          <Check className="w-3.5 h-3.5 text-white absolute inset-0 m-auto pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
        </div>

        {(label || description) && (
          <div className="flex flex-col text-left">
            {label && (
              <label
                htmlFor={id}
                className={cn(
                  'text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer',
                  disabled && 'cursor-not-allowed opacity-50'
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{description}</span>
            )}
            {error && <span className="text-[11px] font-medium text-rose-600 mt-0.5">{error}</span>}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
