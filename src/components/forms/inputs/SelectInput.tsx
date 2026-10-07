import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Select, SelectProps, SelectOption } from '../../ui/Select';
import { FormField } from '../fields/FormField';

export interface SelectInputProps extends Omit<SelectProps, 'name'> {
  name: string;
  label?: string;
  helperText?: string;
  required?: boolean;
  options: SelectOption[];
  placeholderOption?: string;
}

export const SelectInput: React.FC<SelectInputProps> = React.memo(
  ({ name, label, helperText, required, options, placeholderOption = '-- Select Option --', ...props }) => {
    const formContext = useFormContext();
    const error = formContext?.formState?.errors?.[name]?.message as string | undefined;
    const register = formContext?.register;

    const formattedOptions: SelectOption[] = placeholderOption
      ? [{ label: placeholderOption, value: '' }, ...options]
      : options;

    return (
      <FormField name={name} label={label} error={error} helperText={helperText} required={required}>
        <Select
          id={`select-${name}`}
          options={formattedOptions}
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

SelectInput.displayName = 'SelectInput';
