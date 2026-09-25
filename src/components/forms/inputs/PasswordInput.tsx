import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { Input, InputProps } from '../../ui/Input';
import { FormField } from '../fields/FormField';

export interface PasswordInputProps extends Omit<InputProps, 'name' | 'type'> {
  name: string;
  label?: string;
  helperText?: string;
  required?: boolean;
  showStrengthMeter?: boolean;
}

export const PasswordInput: React.FC<PasswordInputProps> = React.memo(
  ({ name, label = 'Password', helperText, required, showStrengthMeter = false, ...props }) => {
    const [showPassword, setShowPassword] = useState(false);
    const formContext = useFormContext();
    const error = formContext?.formState?.errors?.[name]?.message as string | undefined;
    const register = formContext?.register;
    const watchValue = formContext?.watch ? formContext.watch(name) : '';

    const calculateStrength = (pwd: string): number => {
      if (!pwd) return 0;
      let score = 0;
      if (pwd.length >= 8) score += 25;
      if (/[A-Z]/.test(pwd)) score += 25;
      if (/[0-9]/.test(pwd)) score += 25;
      if (/[@$!%*?&]/.test(pwd)) score += 25;
      return score;
    };

    const strength = calculateStrength(watchValue || '');

    return (
      <FormField name={name} label={label} error={error} helperText={helperText} required={required}>
        <Input
          id={`pwd-${name}`}
          type={showPassword ? 'text' : 'password'}
          leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-400 hover:text-slate-600 focus:outline-none p-1"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          aria-invalid={!!error}
          aria-required={required}
          {...(register ? register(name) : {})}
          {...props}
          error={error}
        />

        {showStrengthMeter && watchValue && watchValue.length > 0 && (
          <div className="mt-1.5 space-y-1">
            <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  strength <= 25
                    ? 'bg-red-500 w-1/4'
                    : strength <= 50
                    ? 'bg-amber-500 w-2/4'
                    : strength <= 75
                    ? 'bg-blue-500 w-3/4'
                    : 'bg-emerald-500 w-full'
                }`}
              />
            </div>
            <span className="text-[10px] font-semibold text-slate-500 block text-right">
              Strength: {strength <= 25 ? 'Weak' : strength <= 50 ? 'Fair' : strength <= 75 ? 'Good' : 'Strong'}
            </span>
          </div>
        )}
      </FormField>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
