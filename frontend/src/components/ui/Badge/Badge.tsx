import React from 'react';
import { StudentStatus } from '../../../types/student';

interface BadgeProps {
  status?: StudentStatus | string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'neutral';
  children?: React.ReactNode;
  showDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  status,
  variant,
  children,
  showDot = true
}) => {
  // Map StudentStatus to color variants
  let computedVariant = variant || 'neutral';
  let label = children;

  if (status) {
    label = status;
    switch (status) {
      case 'ACTIVE':
        computedVariant = 'success';
        break;
      case 'SUSPENDED':
        computedVariant = 'danger';
        break;
      case 'INACTIVE':
        computedVariant = 'warning';
        break;
      case 'GRADUATED':
        computedVariant = 'purple';
        break;
      case 'ALUMNI':
        computedVariant = 'info';
        break;
      default:
        computedVariant = 'neutral';
    }
  }

  const variantStyles: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    success: { bg: 'var(--success-bg)', text: 'var(--success-text)', border: 'var(--success-border)', dot: 'var(--success-dot)' },
    warning: { bg: 'var(--warning-bg)', text: 'var(--warning-text)', border: 'var(--warning-border)', dot: 'var(--warning-dot)' },
    danger: { bg: 'var(--danger-bg)', text: 'var(--danger-text)', border: 'var(--danger-border)', dot: 'var(--danger-dot)' },
    info: { bg: 'var(--info-bg)', text: 'var(--info-text)', border: 'var(--info-border)', dot: 'var(--info-dot)' },
    purple: { bg: 'var(--purple-bg)', text: 'var(--purple-text)', border: 'var(--purple-border)', dot: 'var(--purple-dot)' },
    neutral: { bg: 'var(--slate-100)', text: 'var(--slate-700)', border: 'var(--slate-200)', dot: 'var(--slate-400)' }
  };

  const style = variantStyles[computedVariant] || variantStyles.neutral;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding: '0.2rem 0.625rem',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.025em',
        backgroundColor: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
      }}
    >
      {showDot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: style.dot,
          }}
        />
      )}
      {label}
    </span>
  );
};
