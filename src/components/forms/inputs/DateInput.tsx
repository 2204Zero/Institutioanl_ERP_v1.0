import React from 'react';
import { Calendar } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { Input, InputProps } from '../../ui/Input';
import { FormField } from '../fields/FormField';

export interface DateInputProps extends Omit<InputProps, 'name' | 'type'> {
  name: string;
  label?: string;
  helperText?: string;
  required?: boolean;
  minDate?: string;
  maxDate?: string;
}

export const DateInput: React.FC<DateInputProps> = React.memo(
  ({ name, label, helperText, required, minDate, maxDate, ...props }) => {
    const formContext = useFormContext();
    const error = formContext?.formState?.errors?.[name]?.message as string | undefined;
    const register = formContext?.register;

    return (
      <FormField name={name} label={label} error={error} helperText={helperText} required={required}>
        <Input
          id={`date-${name}`}
          type="date"
          min={minDate}
          max={maxDate}
          leftIcon={<Calendar className="w-4 h-4 text-slate-400" />}
          aria-invalid={!!error}
          aria-required={required}
          {...(register ? register(name) : {})}
          {...props}
          error={error}
        />
      </FormField>
    );
  }
);

DateInput.displayName = 'DateInput';
