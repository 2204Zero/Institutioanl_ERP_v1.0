import React from 'react';
import { RequiredIndicator } from './RequiredIndicator';
import { cn } from '../../../utils/cn';

export interface FieldLabelProps {
  htmlFor?: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}

export const FieldLabel: React.FC<FieldLabelProps> = React.memo(
  ({ htmlFor, children, required = false, className }) => {
    if (!children) return null;

    return (
      <label
        htmlFor={htmlFor}
        className={cn('text-xs font-bold text-slate-700 tracking-tight flex items-center', className)}
      >
        <span>{children}</span>
        {required && <RequiredIndicator />}
      </label>
    );
  }
);

FieldLabel.displayName = 'FieldLabel';
