import React from 'react';
import { FieldLabel } from './FieldLabel';
import { HelperText } from './HelperText';
import { ErrorMessage } from './ErrorMessage';
import { cn } from '../../../utils/cn';

export interface FormFieldProps {
  id?: string;
  name: string;
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = React.memo(
  ({ id, name, label, error, helperText, required = false, className, children }) => {
    const fieldId = id || `field-${name}`;
    const errorId = error ? `${fieldId}-error` : undefined;
    const helperId = helperText ? `${fieldId}-helper` : undefined;

    return (
      <div className={cn('flex flex-col gap-1 w-full text-left', className)}>
        {label && (
          <FieldLabel htmlFor={fieldId} required={required}>
            {label}
          </FieldLabel>
        )}

        <div className="relative w-full">{children}</div>

        {helperText && <HelperText id={helperId}>{helperText}</HelperText>}
        {error && <ErrorMessage id={errorId} message={error} />}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
