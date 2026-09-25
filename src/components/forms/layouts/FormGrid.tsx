import React from 'react';
import { cn } from '../../../utils/cn';

export interface FormGridProps {
  cols?: 1 | 2 | 3 | 4;
  gap?: 2 | 3 | 4 | 6 | 8;
  children: React.ReactNode;
  className?: string;
}

export const FormGrid: React.FC<FormGridProps> = React.memo(
  ({ cols = 2, gap = 4, children, className }) => {
    const colClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    };

    const gapClasses = {
      2: 'gap-2',
      3: 'gap-3',
      4: 'gap-4',
      6: 'gap-6',
      8: 'gap-8',
    };

    return (
      <div className={cn('grid w-full text-left', colClasses[cols], gapClasses[gap], className)}>
        {children}
      </div>
    );
  }
);

FormGrid.displayName = 'FormGrid';
