import React from 'react';
import { cn } from '../../../utils/cn';

export interface CharacterCounterProps {
  currentLength: number;
  maxLength: number;
  className?: string;
}

export const CharacterCounter: React.FC<CharacterCounterProps> = React.memo(
  ({ currentLength, maxLength, className }) => {
    const isNearLimit = currentLength >= maxLength * 0.9;
    const isOverLimit = currentLength > maxLength;

    return (
      <span
        className={cn(
          'text-[10px] font-mono font-medium text-slate-400 select-none ml-auto',
          isNearLimit && 'text-amber-600 font-bold',
          isOverLimit && 'text-red-600 font-bold',
          className
        )}
      >
        {currentLength} / {maxLength}
      </span>
    );
  }
);

CharacterCounter.displayName = 'CharacterCounter';
