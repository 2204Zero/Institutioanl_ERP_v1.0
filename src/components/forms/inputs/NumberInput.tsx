import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input, InputProps } from '../../ui/Input';
import { FormField } from '../fields/FormField';

export interface NumberInputProps extends Omit<InputProps, 'name' | 'type'> {
  name: string;
  label?: string;
  helperText?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  prefixSymbol?: string;
}

export const NumberInput: React.FC<NumberInputProps> = React.memo(
  ({ name, label, helperText, required, min, max, step = 1, prefixSymbol, ...props }) => {
    const formContext = useFormContext();
    const error = formContext?.formState?.errors?.[name]?.message as string | undefined;
    const register = formContext?.register;

    return (
      <FormField name={name} label={label} error={error} helperText={helperText} required={required}>
        <Input
          id={`number-${name}`}
          type="number"
          min={min}
          max={max}
          step={step}
          leftIcon={prefixSymbol ? <span className="text-xs font-bold text-slate-500 font-mono">{prefixSymbol}</span> : undefined}
          aria-invalid={!!error}
          aria-required={required}
          {...(register ? register(name, { valueAsNumber: true }) : {})}
          {...props}
          error={error}
        />
      </FormField>
    );
  }
);

NumberInput.displayName = 'NumberInput';
