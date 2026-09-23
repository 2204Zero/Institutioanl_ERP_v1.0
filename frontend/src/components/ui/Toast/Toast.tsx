import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  const isSuccess = type === 'success';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        backgroundColor: '#ffffff',
        border: `1px solid ${isSuccess ? 'var(--success-border)' : 'var(--danger-border)'}`,
        boxShadow: 'var(--shadow-lg)',
        borderRadius: 'var(--radius-md)',
        padding: '0.875rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        zIndex: 100,
        maxWidth: '420px',
        animation: 'slideInRight 0.25s ease-out',
      }}
    >
      {isSuccess ? (
        <CheckCircle2 size={20} color="var(--success-dot)" />
      ) : (
        <AlertCircle size={20} color="var(--danger-dot)" />
      )}
      <span style={{ fontSize: '0.875rem', color: 'var(--slate-800)', flex: 1 }}>
        {message}
      </span>
      <button
        onClick={onClose}
        style={{ color: 'var(--slate-400)', display: 'flex', alignItems: 'center' }}
      >
        <X size={16} />
      </button>
    </div>
  );
};
