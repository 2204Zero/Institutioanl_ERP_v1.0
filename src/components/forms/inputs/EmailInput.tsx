import React from 'react';
import { Mail } from 'lucide-react';
import { TextInput, TextInputProps } from './TextInput';

export type EmailInputProps = Omit<TextInputProps, 'type'>;

export const EmailInput: React.FC<EmailInputProps> = React.memo((props) => {
  return (
    <TextInput
      type="email"
      leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
      placeholder="user@institution.edu"
      autoComplete="email"
      {...props}
    />
  );
});

EmailInput.displayName = 'EmailInput';
