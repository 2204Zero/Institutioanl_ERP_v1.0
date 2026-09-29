import React from 'react';
import { cn } from '../../../utils/cn';

export interface FormContainerProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  className?: string;
  id?: string;
  ariaLabel?: string;
}

export const FormContainer = React.forwardRef<HTMLFormElement, FormContainerProps>(
  ({ children, onSubmit, className, id, ariaLabel = 'Institutional Form', ...props }, ref) => {
    return (
      <form
        ref={ref}
        id={id}
        onSubmit={onSubmit}
        noValidate
        aria-label={ariaLabel}
        className={cn('space-y-6 text-left w-full', className)}
        {...props}
      >
        {children}
      </form>
    );
  }
);

FormContainer.displayName = 'FormContainer';
