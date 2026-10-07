import React from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '../../ui/Button';

export interface ResetButtonProps {
  label?: string;
  onReset: () => void;
  disabled?: boolean;
  className?: string;
}

export const ResetButton: React.FC<ResetButtonProps> = React.memo(
  ({ label = 'Reset Form', onReset, disabled = false, className }) => {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={onReset}
        disabled={disabled}
        icon={<RotateCcw className="w-4 h-4 text-slate-500" />}
        className={className}
      >
        {label}
      </Button>
    );
  }
);

ResetButton.displayName = 'ResetButton';
