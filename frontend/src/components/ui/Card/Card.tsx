import React from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  headerAction,
  children,
  style,
  className = '',
}) => {
  return (
    <div
      className={className}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--slate-200)',
        boxShadow: 'var(--shadow-xs)',
        overflow: 'hidden',
        ...style,
      }}
    >
      {(title || headerAction) && (
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--slate-100)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            {title && (
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--slate-800)' }}>
                {title}
              </h4>
            )}
            {subtitle && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div style={{ padding: '1.5rem' }}>{children}</div>
    </div>
  );
};
