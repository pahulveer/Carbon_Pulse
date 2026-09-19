import React from 'react';
import { X, Play, ShieldAlert, Compass, Target, ArrowRight } from 'lucide-react';

interface WatchDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerScenario: (scenario: 'balanced' | 'exceeded') => void;
  onTriggerAbsurd: () => void;
}

export const WatchDemoModal: React.FC<WatchDemoModalProps> = ({
  isOpen,
  onClose,
  onTriggerScenario,
  onTriggerAbsurd,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="demo-title">
      <div className="modal-dialog" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--forest-800)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Play size={16} fill="#ffffff" style={{ marginLeft: '1px' }} />
            </div>
            <div>
              <h2 id="demo-title" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--forest-950)' }}>
                Carbon Pulse Interactive Tour
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Explore the key decision points and cognitive design innovations
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon" aria-label="Close demo tour">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Key Feature 1 */}
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-lg)',
              background: '#ffffff',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <Compass size={18} color="var(--forest-700)" />
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--forest-950)' }}>
                Decision Point 3: Deterministic Week Pacing
              </h3>
              <span className="badge badge-emerald" style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>
                Active Telemetry
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '10px' }}>
              Instead of naive totals, Carbon Pulse mathematically aligns elapsed calendar days with remaining carbon budget to prevent weekend overages.
            </p>
            <button
              onClick={() => {
                onClose();
                onTriggerScenario('balanced');
              }}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <span>Load Balanced On-Pace Demo</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Key Feature 2 */}
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-lg)',
              background: '#ffffff',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <Target size={18} color="var(--rose-500)" />
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--forest-950)' }}>
                Decision Point 1: Supportive Non-Punitive Nudge
              </h3>
              <span className="badge badge-rose" style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>
                Target Exceeded
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '10px' }}>
              When your target is exceeded, Carbon Pulse never shames you. It displays an empathetic coaching banner with 3 actionable pivots.
            </p>
            <button
              onClick={() => {
                onClose();
                onTriggerScenario('exceeded');
              }}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <span>Trigger Exceeded Target Nudge</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Key Feature 3 */}
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-lg)',
              background: '#ffffff',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <ShieldAlert size={18} color="var(--amber-500)" />
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--forest-950)' }}>
                Decision Point 2: Absurd Input Anomaly Interceptor
              </h3>
              <span className="badge badge-amber" style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>
                Safety Guardrail
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '10px' }}>
              Accidentally type 500,000 km instead of 50 km? Carbon Pulse catches statistical anomalies before they distort your weekly charts.
            </p>
            <button
              onClick={() => {
                onClose();
                onTriggerAbsurd();
              }}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <span>Test Absurd Input Interceptor</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn btn-primary btn-sm">
            Close Tour
          </button>
        </div>
      </div>
    </div>
  );
};
