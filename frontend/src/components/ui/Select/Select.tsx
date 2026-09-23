import React from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Option[];
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  placeholder,
  id,
  required,
  style,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%' }}>
      {label && (
        <label
          htmlFor={selectId}
          style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)' }}
        >
          {label} {required && <span style={{ color: 'var(--danger-dot)' }}>*</span>}
        </label>
      )}
      <select
        id={selectId}
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
          cursor: 'pointer',
          ...style,
        }}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span style={{ fontSize: '0.75rem', color: 'var(--danger-text)' }}>
          {error}
        </span>
      )}
    </div>
  );
};
