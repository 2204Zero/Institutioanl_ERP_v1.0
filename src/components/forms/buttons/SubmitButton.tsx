import React from 'react';
import { Send } from 'lucide-react';
import { Button } from '../../ui/Button';

export interface SubmitButtonProps {
  label?: string;
  icon?: React.ReactNode;
  isSubmitting?: boolean;
  disabled?: boolean;
  className?: string;
}

export const SubmitButton: React.FC<SubmitButtonProps> = React.memo(
  ({
    label = 'Submit Form',
    icon = <Send className="w-4 h-4" />,
    isSubmitting = false,
    disabled = false,
    className,
  }) => {
    return (
      <Button
        type="submit"
        variant="primary"
        loading={isSubmitting}
        disabled={disabled || isSubmitting}
        icon={!isSubmitting ? icon : undefined}
        className={className}
      >
        {isSubmitting ? 'Submitting Form...' : label}
      </Button>
    );
  }
);

SubmitButton.displayName = 'SubmitButton';
