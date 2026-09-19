import React from 'react';
import { X, UserCheck, Shield } from 'lucide-react';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPersona: (personaName: string, targetKg: number) => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({
  isOpen,
  onClose,
  onSelectPersona,
}) => {
  if (!isOpen) return null;

  const personas = [
    {
      id: 'maya',
      name: 'Maya Lin',
      role: 'Urban Commuter & Designer',
      targetKg: 20,
      badge: 'Active Profile',
      description: 'Uses transit, works from home 2 days/week, tracks meals and cycling commutes.',
    },
    {
      id: 'leo',
      name: 'Dr. Leo Vance',
      role: 'Climate Systems Researcher',
      targetKg: 15,
      badge: 'Aggressive Net-Zero',
      description: '100% solar powered household, strictly plant-based, zero private vehicle use.',
    },
    {
      id: 'judge',
      name: 'Hackathon Judge / Auditor',
      role: 'Evaluation Mode',
      targetKg: 25,
      badge: 'Full Access',
      description: 'Pre-configured with full telemetry fixtures, anomaly scenarios, and export tools.',
    },
  ];

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="signin-title">
      <div className="modal-dialog" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(45, 106, 79, 0.12)',
                color: 'var(--forest-800)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UserCheck size={18} />
            </div>
            <div>
              <h2 id="signin-title" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--forest-950)' }}>
                Account & Persona Profiles
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Switch demo identities or continue as guest (zero cloud tracking)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon" aria-label="Close sign in modal">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(45, 106, 79, 0.06)',
              border: '1px solid rgba(45, 106, 79, 0.15)',
              fontSize: '0.8rem',
              color: 'var(--forest-900)',
            }}
          >
            <Shield size={16} color="var(--forest-700)" />
            <span>
              <strong>Local-First Privacy:</strong> All data remains encrypted in your browser's local store.
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {personas.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  onSelectPersona(p.name, p.targetKg);
                  onClose();
                }}
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-lg)',
                  background: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(45, 106, 79, 0.35)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, color: 'var(--forest-950)', fontSize: '0.95rem' }}>
                    {p.name}
                  </span>
                  <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                    {p.badge}
                  </span>
                </div>
                <span style={{ fontSize: '0.76rem', color: 'var(--forest-700)', fontWeight: 600 }}>
                  {p.role} • Target: {p.targetKg} kg CO₂/week
                </span>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
};
