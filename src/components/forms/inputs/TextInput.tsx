import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input, InputProps } from '../../ui/Input';
import { FormField } from '../fields/FormField';

export interface TextInputProps extends Omit<InputProps, 'name'> {
  name: string;
  label?: string;
  helperText?: string;
  required?: boolean;
}

export const TextInput: React.FC<TextInputProps> = React.memo(
  ({ name, label, helperText, required, ...props }) => {
    const formContext = useFormContext();
    const error = formContext?.formState?.errors?.[name]?.message as string | undefined;
    const register = formContext?.register;

    return (
      <FormField name={name} label={label} error={error} helperText={helperText} required={required}>
        <Input
          id={`input-${name}`}
          aria-invalid={!!error}
          aria-required={required}
          aria-describedby={error ? `field-${name}-error` : helperText ? `field-${name}-helper` : undefined}
          {...(register ? register(name) : {})}
          {...props}
          error={error}
        />
      </FormField>
    );
  }
);

TextInput.displayName = 'TextInput';
