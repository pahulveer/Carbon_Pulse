import React from 'react';
import { AlertTriangle, Check, RotateCcw } from 'lucide-react';
import type { ActivityType } from '../types';
import { ACTIVITY_DEFINITIONS, calculateCO2 } from '../lib/emissions';

interface AbsurdInputModalProps {
  isOpen: boolean;
  activityType: ActivityType;
  quantity: number;
  reason: string;
  onConfirmAnyway: () => void;
  onEditEntry: () => void;
}

export const AbsurdInputModal: React.FC<AbsurdInputModalProps> = ({
  isOpen,
  activityType,
  quantity,
  reason,
  onConfirmAnyway,
  onEditEntry,
}) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        e.stopPropagation();
        onEditEntry();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onEditEntry]);

  if (!isOpen) return null;

  const def = ACTIVITY_DEFINITIONS[activityType];
  const calculatedCO2 = calculateCO2(activityType, quantity);

  return (
    <div className="modal-backdrop" role="alertdialog" aria-modal="true" aria-labelledby="absurd-modal-title">
      <div
        className="modal-dialog"
        style={{
          border: '1px solid rgba(251, 191, 36, 0.4)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(245, 158, 11, 0.2)',
          maxWidth: '500px',
        }}
      >
        {/* Warning Accent Banner */}
        <div
          style={{
            height: '4px',
            background: 'linear-gradient(90deg, #F59E0B 0%, #EF4444 100%)',
          }}
        />

        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {/* Header icon and title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--amber-400)',
              }}
            >
              <AlertTriangle size={24} />
            </div>
            <div>
              <span className="badge badge-amber" style={{ fontSize: '0.72rem', marginBottom: '4px' }}>
                ANOMALY DETECTION (DP2)
              </span>
              <h3 id="absurd-modal-title" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--forest-950)' }}>
                UNUSUALLY LARGE ENTRY
              </h3>
            </div>
          </div>

          {/* Mathematical Impact Card */}
          <div
            style={{
              background: '#FFFBEB',
              border: '1.5px solid rgba(245, 158, 11, 0.35)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px 18px',
              marginBottom: '18px',
              boxShadow: 'var(--shadow-subtle)',
            }}
          >
            <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Input: <strong style={{ color: 'var(--forest-950)' }}>{quantity.toLocaleString()} {def.unit}</strong> of{' '}
              {def.label.toLowerCase()}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
              Resulting Footprint:
            </div>
            <div
              style={{
                fontSize: '1.9rem',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                color: 'var(--amber-600)',
                margin: '4px 0 8px 0',
              }}
            >
              {calculatedCO2.toLocaleString()} kg CO₂
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Formula: {quantity.toLocaleString()} {def.unit} × {def.factor.toFixed(2)} kg/{def.unit}
            </div>
          </div>

          {/* Human Explanation */}
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.92rem',
              lineHeight: '1.55',
              marginBottom: '22px',
            }}
          >
            {reason || `This value is unusually large for a single activity. Please verify the quantity before saving.`}
            <br />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>
              We flag potential typos without silently clamping or discarding your data.
            </span>
          </p>

          {/* User Decision Actions */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={onEditEntry}
              className="btn btn-secondary"
              style={{
                flex: '1 1 140px',
              }}
            >
              <RotateCcw size={16} />
              <span>EDIT ENTRY</span>
            </button>

            <button
              onClick={onConfirmAnyway}
              className="btn btn-primary"
              style={{
                flex: '1 1 160px',
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
              }}
            >
              <Check size={16} />
              <span>CONFIRM ANYWAY</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
