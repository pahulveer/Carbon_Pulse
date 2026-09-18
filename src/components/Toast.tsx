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
      icon: <CheckCircle2 size={18} color="var(--emerald-400)" />,
      border: 'rgba(52, 211, 153, 0.4)',
      bg: 'rgba(10, 20, 32, 0.96)',
    },
    warning: {
      icon: <AlertTriangle size={18} color="var(--amber-400)" />,
      border: 'rgba(245, 158, 11, 0.4)',
      bg: 'rgba(22, 18, 10, 0.96)',
    },
    error: {
      icon: <XCircle size={18} color="var(--rose-400)" />,
      border: 'rgba(244, 63, 94, 0.4)',
      bg: 'rgba(25, 12, 18, 0.96)',
    },
    info: {
      icon: <Info size={18} color="var(--sky-400)" />,
      border: 'rgba(56, 189, 248, 0.4)',
      bg: 'rgba(10, 18, 30, 0.96)',
    },
  }[toast.type];

  return (
    <div
      role="alert"
      style={{
        pointerEvents: 'auto',
        background: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '12px',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <div style={{ marginTop: '2px' }}>{config.icon}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#FFFFFF' }}>{toast.title}</div>
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
          color: 'var(--text-dim)',
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
