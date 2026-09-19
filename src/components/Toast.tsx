import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import type { ToastMessage } from '../types';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1100,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '380px',
        width: '100%',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const config = {
    success: {
      icon: <CheckCircle2 size={18} color="var(--forest-700)" />,
      border: 'var(--sage-200)',
      bg: '#FFFFFF',
      accent: 'var(--forest-700)',
    },
    warning: {
      icon: <AlertTriangle size={18} color="var(--amber-600)" />,
      border: 'rgba(245, 158, 11, 0.35)',
      bg: '#FFFBEB',
      accent: 'var(--amber-500)',
    },
    error: {
      icon: <XCircle size={18} color="var(--rose-500)" />,
      border: 'rgba(225, 29, 72, 0.35)',
      bg: '#FFF1F2',
      accent: 'var(--rose-500)',
    },
    info: {
      icon: <Info size={18} color="var(--forest-800)" />,
      border: 'var(--border-subtle)',
      bg: '#FFFFFF',
      accent: 'var(--forest-800)',
    },
  }[toast.type];

  return (
    <div
      role="alert"
      style={{
        pointerEvents: 'auto',
        background: config.bg,
        border: `1.5px solid ${config.border}`,
        borderLeft: `4px solid ${config.accent}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-floating)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '12px',
        animation: 'fadeIn 0.2s ease-out',
        minWidth: '280px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <div style={{ marginTop: '2px' }}>{config.icon}</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--forest-950)' }}>{toast.title}</div>
          {toast.description && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {toast.description}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        style={{
          color: 'var(--text-muted)',
          background: 'none',
          border: 'none',
          padding: '2px',
          cursor: 'pointer',
        }}
      >
        <X size={15} />
      </button>
    </div>
  );
};
