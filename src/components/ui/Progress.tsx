import React from 'react';
import { cn } from '../../utils/cn';

export interface ProgressProps {
  value: number; // 0 to 100
  color?: string;
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({ value, color = 'bg-brand-600', className }) => {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn('w-full bg-slate-100 rounded-full h-2 overflow-hidden', className)}>
      <div
        className={cn('h-full transition-all duration-300 rounded-full', color)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
};
