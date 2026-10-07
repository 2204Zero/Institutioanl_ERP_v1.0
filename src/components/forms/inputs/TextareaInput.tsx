import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Textarea, TextareaProps } from '../../ui/Textarea';
import { FormField } from '../fields/FormField';
import { CharacterCounter } from '../fields/CharacterCounter';

export interface TextareaInputProps extends Omit<TextareaProps, 'name'> {
  name: string;
  label?: string;
  helperText?: string;
  required?: boolean;
  maxLength?: number;
  showCounter?: boolean;
}

export const TextareaInput: React.FC<TextareaInputProps> = React.memo(
  ({ name, label, helperText, required, maxLength = 500, showCounter = true, ...props }) => {
    const formContext = useFormContext();
    const error = formContext?.formState?.errors?.[name]?.message as string | undefined;
    const register = formContext?.register;
    const watchValue = formContext?.watch ? formContext.watch(name) : '';
    const currentLength = typeof watchValue === 'string' ? watchValue.length : 0;

    return (
      <FormField name={name} label={label} error={error} helperText={helperText} required={required}>
        <Textarea
          id={`textarea-${name}`}
          aria-invalid={!!error}
          aria-required={required}
          maxLength={maxLength}
          {...(register ? register(name) : {})}
          {...props}
          error={error}
        />
        {showCounter && maxLength > 0 && (
          <div className="flex justify-end mt-1">
            <CharacterCounter currentLength={currentLength} maxLength={maxLength} />
          </div>
        )}
      </FormField>
    );
  }
);

TextareaInput.displayName = 'TextareaInput';
