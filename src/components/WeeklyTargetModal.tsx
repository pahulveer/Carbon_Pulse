import React, { useState } from 'react';
import { Target, X, Check, Info } from 'lucide-react';

interface WeeklyTargetModalProps {
  isOpen: boolean;
  currentTarget: number;
  currentWeeklyFootprint: number;
  onClose: () => void;
  onSaveTarget: (targetKg: number) => void;
}

const PRESET_TARGETS = [
  { value: 15, label: '15 kg', description: 'Strict / High Ambition' },
  { value: 20, label: '20 kg', description: 'Standard / Balanced (Recommended)' },
  { value: 25, label: '25 kg', description: 'Moderate Commute Allowance' },
  { value: 35, label: '35 kg', description: 'High Travel Flexibility' },
];

export const WeeklyTargetModal: React.FC<WeeklyTargetModalProps> = ({
  isOpen,
  currentTarget,
  currentWeeklyFootprint,
  onClose,
  onSaveTarget,
}) => {
  const [targetInput, setTargetInput] = useState<string>(currentTarget.toString());
  const [targetError, setTargetError] = useState<string | null>(null);
  const [prevOpen, setPrevOpen] = useState(isOpen);

  if (isOpen !== prevOpen) {
    setPrevOpen(isOpen);
    if (isOpen) {
      setTargetInput(currentTarget.toString());
      setTargetError(null);
    }
  }

  if (!isOpen) return null;

  const parsedVal = parseFloat(targetInput);
  const isValid = !isNaN(parsedVal) && parsedVal >= 1 && parsedVal <= 10000;
  const previewUsedPct = isValid ? Math.round((currentWeeklyFootprint / parsedVal) * 100) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setTargetError('Please enter a target between 1 and 10,000 kg CO₂.');
      return;
    }
    setTargetError(null);
    onSaveTarget(parsedVal);
    onClose();
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="target-modal-title">
      <div className="modal-dialog" style={{ maxWidth: '480px' }}>
        {/* Fixed Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--sage-100)',
                border: '1px solid var(--sage-200)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--forest-700)',
              }}
            >
              <Target size={18} />
            </div>
            <div>
              <h2 id="target-modal-title" style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--forest-950)' }}>
                Set Weekly Carbon Target
              </h2>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                Define your weekly emissions budget (Monday → Sunday)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="btn btn-secondary btn-icon"
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Preset Buttons */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: 'var(--forest-900)',
                marginBottom: '10px',
              }}
            >
              Quick Presets
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {PRESET_TARGETS.map((p) => {
                const isSelected = parsedVal === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setTargetInput(p.value.toString())}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected
                        ? 'linear-gradient(145deg, var(--forest-900) 0%, var(--forest-950) 100%)'
                        : '#FFFFFF',
                      border: isSelected ? '1.5px solid var(--forest-700)' : '1.5px solid var(--border-subtle)',
                      textAlign: 'left',
                      boxShadow: isSelected
                        ? '0 8px 20px -3px rgba(13, 40, 24, 0.28), 0 0 0 2px rgba(45, 106, 79, 0.25)'
                        : 'var(--shadow-subtle)',
                      transition: 'all var(--transition-fast)',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'var(--forest-600)';
                        e.currentTarget.style.background = 'var(--bg-surface-soft)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'var(--border-subtle)';
                        e.currentTarget.style.background = '#FFFFFF';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem', color: isSelected ? '#FFFFFF' : 'var(--forest-950)' }}>
                        {p.label}
                      </span>
                      {isSelected && <Check size={16} color="var(--sage-200)" />}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: isSelected ? 'rgba(255, 255, 255, 0.8)' : 'var(--text-secondary)', marginTop: '4px' }}>
                      {p.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Input */}
          <div>
            <label
              htmlFor="custom-target-input"
              style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: 'var(--forest-900)',
                marginBottom: '8px',
              }}
            >
              Custom Target (kg CO₂ / week)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="custom-target-input"
                type="number"
                step="0.5"
                min="1"
                max="1000"
                value={targetInput}
                onChange={(e) => {
                  setTargetInput(e.target.value);
                  setTargetError(null);
                }}
                required
                style={{
                  width: '100%',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  padding: '12px 16px',
                  background: '#FFFFFF',
                  color: 'var(--forest-950)',
                  border: targetError ? '1.5px solid var(--rose-500)' : '1.5px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-subtle)',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: 'var(--forest-800)',
                  background: 'var(--sage-100)',
                  border: '1px solid var(--sage-200)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-pill)',
                  pointerEvents: 'none',
                }}
              >
                kg CO₂
              </span>
            </div>
            {targetError && (
              <div style={{ marginTop: '6px', fontSize: '0.8rem', color: 'var(--rose-500)', fontWeight: 600 }}>
                {targetError}
              </div>
            )}
          </div>

          {/* Dynamic Impact Preview */}
          <div
            style={{
              background: 'linear-gradient(135deg, var(--sage-100) 0%, #E2EDE0 100%)',
              border: '1.5px solid var(--sage-200)',
              borderRadius: 'var(--radius-lg)',
              padding: '14px 18px',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.9), var(--shadow-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Current Week Footprint:</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--forest-950)' }}>
                {currentWeeklyFootprint.toFixed(1)} / {isValid ? parsedVal.toFixed(1) : '--'} kg
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Target Utilization:</div>
              <div
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  color: previewUsedPct > 100 ? 'var(--rose-500)' : 'var(--forest-800)',
                }}
              >
                {previewUsedPct}%
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '24px',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
            }}
          >
            <Info size={15} style={{ flexShrink: 0 }} />
            <span>Target affects dashboard telemetry, pace indicators, and supportive nudges instantly.</span>
          </div>

          </div>

          {/* Fixed Action Footer */}
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="btn btn-primary"
              style={{ flex: 2, fontWeight: 700 }}
            >
              SAVE TARGET
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
