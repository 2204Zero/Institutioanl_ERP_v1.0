import React from 'react';
import { Phone } from 'lucide-react';
import { TextInput, TextInputProps } from './TextInput';

export type PhoneInputProps = Omit<TextInputProps, 'type'>;

export const PhoneInput: React.FC<PhoneInputProps> = React.memo((props) => {
  return (
    <TextInput
      type="tel"
      leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
      placeholder="+91 98765 43210"
      autoComplete="tel"
      {...props}
    />
  );
});

PhoneInput.displayName = 'PhoneInput';
