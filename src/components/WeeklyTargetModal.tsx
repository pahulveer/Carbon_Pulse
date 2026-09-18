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
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--emerald-400)',
              }}
            >
              <Target size={18} />
            </div>
            <div>
              <h2 id="target-modal-title" style={{ fontSize: '1.12rem', fontWeight: 800 }}>
                Set Weekly Carbon Target
              </h2>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
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
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Preset Buttons */}
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: 'var(--text-secondary)',
                marginBottom: '8px',
              }}
            >
              Quick Presets
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {PRESET_TARGETS.map((p) => {
                const isSelected = parsedVal === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setTargetInput(p.value.toString())}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'rgba(52, 211, 153, 0.15)' : 'rgba(14, 23, 40, 0.8)',
                      border: isSelected ? '1.5px solid var(--emerald-400)' : '1px solid var(--border-subtle)',
                      textAlign: 'left',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: isSelected ? 'var(--emerald-400)' : '#FFFFFF' }}>
                        {p.label}
                      </span>
                      {isSelected && <Check size={14} color="var(--emerald-400)" />}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {p.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Input */}
          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="custom-target-input"
              style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: 'var(--text-secondary)',
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
                  background: 'rgba(8, 14, 25, 0.9)',
                  borderColor: targetError ? 'var(--rose-400)' : undefined,
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  color: 'var(--emerald-400)',
                  pointerEvents: 'none',
                }}
              >
                kg CO₂
              </span>
            </div>
            {targetError && (
              <div style={{ marginTop: '6px', fontSize: '0.8rem', color: 'var(--rose-400)', fontWeight: 500 }}>
                {targetError}
              </div>
            )}
          </div>

          {/* Dynamic Impact Preview */}
          <div
            style={{
              background: 'rgba(10, 16, 28, 0.95)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Current Week Footprint:</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                {currentWeeklyFootprint.toFixed(1)} / {isValid ? parsedVal.toFixed(1) : '--'} kg
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Target Utilization:</div>
              <div
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  color: previewUsedPct > 100 ? 'var(--rose-400)' : 'var(--emerald-400)',
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
