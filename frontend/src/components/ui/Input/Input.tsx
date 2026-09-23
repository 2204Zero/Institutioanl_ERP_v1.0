import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  id,
  required,
  style,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)' }}
        >
          {label} {required && <span style={{ color: 'var(--danger-dot)' }}>*</span>}
        </label>
      )}
      <input
        id={inputId}
        required={required}
        style={{
          width: '100%',
          padding: '0.5rem 0.75rem',
          borderRadius: 'var(--radius-sm)',
          border: error ? '1px solid var(--danger-dot)' : '1px solid var(--slate-300)',
          outline: 'none',
          fontSize: '0.875rem',
          color: 'var(--slate-900)',
          backgroundColor: '#ffffff',
          transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
          ...style,
        }}
        onFocus={(e) => {
          if (!error) {
            e.currentTarget.style.borderColor = 'var(--primary-500)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.15)';
          }
        }}
        onBlur={(e) => {
          if (!error) {
            e.currentTarget.style.borderColor = 'var(--slate-300)';
            e.currentTarget.style.boxShadow = 'none';
          }
        }}
        {...props}
      />
      {error && (
        <span style={{ fontSize: '0.75rem', color: 'var(--danger-text)' }}>
          {error}
        </span>
      )}
      {!error && helperText && (
        <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
          {helperText}
        </span>
      )}
    </div>
  );
};
