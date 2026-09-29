import React from 'react';
import { cn } from '../../../utils/cn';

export interface HelperTextProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
}

export const HelperText: React.FC<HelperTextProps> = React.memo(({ id, children, className }) => {
  if (!children) return null;

  return (
    <span id={id} className={cn('text-[11px] text-slate-500 font-medium leading-tight block mt-0.5', className)}>
      {children}
    </span>
  );
});

HelperText.displayName = 'HelperText';
