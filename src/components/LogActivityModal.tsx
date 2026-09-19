import React, { useState } from 'react';
import {
  X,
  Car,
  Bus,
  Plane,
  Zap,
  Salad,
  Beef,
  Calculator,
  CheckCircle2,
} from 'lucide-react';
import type { ActivityLog, ActivityType } from '../types';
import {
  ACTIVITY_DEFINITIONS,
  getCalculationBreakdown,
  isAbsurdInput,
} from '../lib/emissions';
import { formatDateISO } from '../lib/weekUtils';
import { AbsurdInputModal } from './AbsurdInputModal';

interface LogActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveActivity: (type: ActivityType, quantity: number, date: string, flaggedAsAbsurd?: boolean, notes?: string) => void;
  onUpdateActivity?: (id: string, type: ActivityType, quantity: number, date: string, flaggedAsAbsurd?: boolean, notes?: string) => void;
  editingActivity?: ActivityLog | null;
  initialActivityType?: ActivityType;
  initialQuantity?: number;
}

const ICONS_MAP: Record<ActivityType, React.ReactNode> = {
  car: <Car size={20} />,
  bus: <Bus size={20} />,
  flight: <Plane size={20} />,
  electricity: <Zap size={20} />,
  veg_meal: <Salad size={20} />,
  non_veg_meal: <Beef size={20} />,
};

export const LogActivityModal: React.FC<LogActivityModalProps> = ({
  isOpen,
  onClose,
  onSaveActivity,
  onUpdateActivity,
  editingActivity,
  initialActivityType = 'car',
  initialQuantity,
}) => {
  const [selectedType, setSelectedType] = useState<ActivityType>(
    editingActivity ? editingActivity.type : initialActivityType
  );
  const [quantityStr, setQuantityStr] = useState<string>(
    editingActivity ? String(editingActivity.quantity) : initialQuantity ? String(initialQuantity) : '10'
  );
  const [dateStr, setDateStr] = useState<string>(
    editingActivity ? editingActivity.date : formatDateISO(new Date())
  );
  const [notes, setNotes] = useState<string>(editingActivity?.notes || '');
  const [qtyError, setQtyError] = useState<string | null>(null);

  // DP2 Interception State
  const [pendingAbsurd, setPendingAbsurd] = useState<{
    type: ActivityType;
    quantity: number;
    date: string;
    reason: string;
    notes?: string;
  } | null>(null);

  const [prevOpen, setPrevOpen] = useState(isOpen);

  if (isOpen !== prevOpen) {
    setPrevOpen(isOpen);
    if (isOpen) {
      if (editingActivity) {
        setSelectedType(editingActivity.type);
        setQuantityStr(String(editingActivity.quantity));
        setDateStr(editingActivity.date);
        setNotes(editingActivity.notes || '');
      } else {
        setSelectedType(initialActivityType || 'car');
        setQuantityStr(initialQuantity !== undefined ? String(initialQuantity) : '10');
        setDateStr(formatDateISO(new Date()));
        setNotes('');
      }
      setQtyError(null);
      setPendingAbsurd(null);
    }
  }

  if (!isOpen) return null;

  const currentDef = ACTIVITY_DEFINITIONS[selectedType];
  const parsedQty = parseFloat(quantityStr);
  const validQty = !isNaN(parsedQty) && parsedQty > 0 ? parsedQty : 0;
  const breakdown = getCalculationBreakdown(selectedType, validQty);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validQty || validQty <= 0) {
      setQtyError(`Please enter a valid quantity greater than 0 ${currentDef.unit}.`);
      return;
    }
    setQtyError(null);

    // Check Decision Point 2: Absurd Input
    const anomaly = isAbsurdInput(selectedType, validQty);
    if (anomaly.isAbsurd) {
      // Flag, don't assume: show modal to let user choose
      setPendingAbsurd({
        type: selectedType,
        quantity: validQty,
        date: dateStr,
        reason: anomaly.reason,
        notes: notes.trim() || undefined,
      });
      return;
    }

    // Normal submission
    if (editingActivity && onUpdateActivity) {
      onUpdateActivity(editingActivity.id, selectedType, validQty, dateStr, false, notes.trim() || undefined);
    } else {
      onSaveActivity(selectedType, validQty, dateStr, false, notes.trim() || undefined);
    }
    onClose();
  };

  const handleConfirmAnyway = () => {
    if (pendingAbsurd) {
      if (editingActivity && onUpdateActivity) {
        onUpdateActivity(
          editingActivity.id,
          pendingAbsurd.type,
          pendingAbsurd.quantity,
          pendingAbsurd.date,
          true, // flagged as absurd
          pendingAbsurd.notes
        );
      } else {
        onSaveActivity(
          pendingAbsurd.type,
          pendingAbsurd.quantity,
          pendingAbsurd.date,
          true, // flagged as absurd
          pendingAbsurd.notes
        );
      }
      setPendingAbsurd(null);
      onClose();
    }
  };

  const handleEditEntry = () => {
    setPendingAbsurd(null);
  };

  // Quick preset helper
  const applyPreset = (qty: number, type?: ActivityType) => {
    if (type) setSelectedType(type);
    setQuantityStr(String(qty));
    setQtyError(null);
  };

  // Smart type switching adapts quantity scale to avoid abrupt absurdity or invalid unit scales
  const handleTypeSelect = (newType: ActivityType) => {
    setSelectedType(newType);
    setQtyError(null);
    const curQty = parseFloat(quantityStr);
    if (newType === 'veg_meal' || newType === 'non_veg_meal') {
      if (isNaN(curQty) || curQty > 5 || curQty < 1) {
        setQuantityStr('1');
      }
    } else if (newType === 'flight') {
      if (isNaN(curQty) || curQty < 50) {
        setQuantityStr('250');
      }
    } else if (newType === 'electricity') {
      if (isNaN(curQty) || curQty > 200 || curQty < 1) {
        setQuantityStr('15');
      }
    } else if (newType === 'car' || newType === 'bus') {
      if (isNaN(curQty) || curQty > 500 || curQty < 1) {
        setQuantityStr('10');
      }
    }
  };

  return (
    <>
      <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-log-title">
        <div className="modal-dialog">
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
                <Calculator size={18} />
              </div>
              <div>
                <h2 id="modal-log-title" style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--forest-950)' }}>
                  {editingActivity ? 'Edit Carbon Activity' : 'Log Carbon Activity'}
                </h2>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  {editingActivity ? 'Modify recorded quantity, date, or notes' : 'Record emissions with real-time conversion preview'}
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
            {/* Scrollable Form Body */}
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Step 1: Activity Type Selection */}
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
                  1. Select Activity Type
                </label>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '10px',
                  }}
                >
                  {(Object.keys(ACTIVITY_DEFINITIONS) as ActivityType[]).map((typeKey) => {
                    const def = ACTIVITY_DEFINITIONS[typeKey];
                    const isSelected = selectedType === typeKey;

                    return (
                      <button
                        key={typeKey}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => handleTypeSelect(typeKey)}
                        style={{
                          padding: '12px 8px',
                          borderRadius: 'var(--radius-md)',
                          background: isSelected
                            ? 'linear-gradient(145deg, var(--forest-900) 0%, var(--forest-950) 100%)'
                            : '#FFFFFF',
                          border: isSelected ? '1.5px solid var(--forest-700)' : '1.5px solid var(--border-subtle)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '6px',
                          textAlign: 'center',
                          boxShadow: isSelected
                            ? '0 8px 20px -3px rgba(13, 40, 24, 0.28), 0 0 0 2px rgba(45, 106, 79, 0.25)'
                            : 'var(--shadow-subtle)',
                          overflow: 'hidden',
                          transition: 'all var(--transition-fast)',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = 'var(--forest-600)';
                            e.currentTarget.style.background = 'var(--bg-surface-soft)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = 'var(--border-subtle)';
                            e.currentTarget.style.background = '#FFFFFF';
                            e.currentTarget.style.transform = 'none';
                          }
                        }}
                      >
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: isSelected ? 'rgba(255, 255, 255, 0.14)' : 'var(--sage-100)',
                            color: isSelected ? '#FFFFFF' : 'var(--forest-700)',
                            transition: 'all var(--transition-fast)',
                          }}
                        >
                          {ICONS_MAP[typeKey]}
                        </div>
                        <span
                          style={{
                            fontSize: '0.8rem',
                            fontWeight: isSelected ? 800 : 600,
                            color: isSelected ? '#FFFFFF' : 'var(--forest-950)',
                            lineHeight: 1.2,
                          }}
                        >
                          {def.label}
                        </span>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 600,
                            padding: '2px 6px',
                            borderRadius: 'var(--radius-pill)',
                            background: isSelected ? 'rgba(255, 255, 255, 0.15)' : 'rgba(45, 106, 79, 0.08)',
                            color: isSelected ? 'var(--sage-200)' : 'var(--forest-700)',
                          }}
                        >
                          {def.factor.toFixed(2)} kg/{def.unit}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Quantity Input with Dynamic Units */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <label
                    htmlFor="activity-qty-input"
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: 'var(--forest-900)',
                    }}
                  >
                    2. Enter Quantity ({currentDef.unit})
                  </label>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                    Unit: <strong style={{ color: 'var(--forest-950)' }}>{currentDef.unitLabelPlural}</strong>
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input
                      id="activity-qty-input"
                      type="number"
                      step="any"
                      min="0"
                      placeholder={`e.g. 10`}
                      value={quantityStr}
                      onChange={(e) => {
                        setQuantityStr(e.target.value);
                        setQtyError(null);
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
                        border: qtyError ? '1.5px solid var(--rose-500)' : '1.5px solid var(--border-subtle)',
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
                      {currentDef.unit}
                    </span>
                  </div>
                </div>

                {qtyError && (
                  <div style={{ marginTop: '6px', fontSize: '0.78rem', color: 'var(--rose-500)', fontWeight: 600 }}>
                    {qtyError}
                  </div>
                )}

                {/* Quick Preset Buttons */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: '2px' }}>
                    Presets:
                  </span>
                  {(selectedType === 'car' || selectedType === 'bus'
                    ? [5, 15, 40]
                    : selectedType === 'flight'
                    ? [250, 800, 2500]
                    : selectedType === 'electricity'
                    ? [5, 15, 50]
                    : [1, 2, 3]
                  ).map((val) => {
                    const isActive = parsedQty === val;
                    const label = `${val} ${currentDef.unit}`;
                    return (
                      <button
                        key={val}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => applyPreset(val)}
                        style={{
                          padding: '4px 12px',
                          fontSize: '0.74rem',
                          fontWeight: isActive ? 700 : 500,
                          borderRadius: 'var(--radius-pill)',
                          background: isActive ? 'var(--forest-800)' : 'var(--bg-canvas)',
                          border: isActive ? '1px solid var(--forest-900)' : '1px solid var(--border-subtle)',
                          color: isActive ? '#FFFFFF' : 'var(--forest-900)',
                          boxShadow: isActive ? '0 2px 6px rgba(27, 67, 50, 0.25)' : 'none',
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)',
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = 'var(--sage-200)';
                            e.currentTarget.style.borderColor = 'var(--forest-600)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = 'var(--bg-canvas)';
                            e.currentTarget.style.borderColor = 'var(--border-subtle)';
                          }
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3 & 4: Date & Notes in Compact 2-Column Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
                  gap: '12px',
                }}
              >
                {/* Step 3: Date Picker */}
                <div>
                  <label
                    htmlFor="activity-date-input"
                    style={{
                      display: 'block',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: 'var(--forest-900)',
                      marginBottom: '6px',
                    }}
                  >
                    3. Date of Activity
                  </label>
                  <input
                    id="activity-date-input"
                    type="date"
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontFamily: 'var(--font-mono)',
                      background: '#FFFFFF',
                      color: 'var(--forest-950)',
                      border: '1.5px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.88rem',
                      boxShadow: 'var(--shadow-subtle)',
                    }}
                  />
                </div>

                {/* Optional Notes */}
                <div>
                  <label
                    htmlFor="activity-notes-input"
                    style={{
                      display: 'block',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: 'var(--forest-900)',
                      marginBottom: '6px',
                    }}
                  >
                    4. Note (Optional)
                  </label>
                  <input
                    id="activity-notes-input"
                    type="text"
                    placeholder="e.g. Commute to office"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    maxLength={80}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: '#FFFFFF',
                      color: 'var(--forest-950)',
                      border: '1.5px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.88rem',
                      boxShadow: 'var(--shadow-subtle)',
                    }}
                  />
                </div>
              </div>

              {/* Transparent Calculation Preview Box */}
              <div
                style={{
                  background: 'linear-gradient(135deg, var(--sage-100) 0%, #E2EDE0 100%)',
                  border: '1.5px solid var(--sage-200)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '14px 18px',
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.9), var(--shadow-subtle)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}
                >
                  <span className="badge badge-emerald" style={{ fontSize: '0.68rem', fontWeight: 700 }}>
                    Live Conversion Preview
                  </span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    Factor: {currentDef.factor.toFixed(2)} kg/{currentDef.unit}
                  </span>
                </div>

                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.84rem',
                    color: 'var(--forest-800)',
                    fontWeight: 600,
                    background: 'rgba(255, 255, 255, 0.75)',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(45, 106, 79, 0.12)',
                    marginBottom: '10px',
                  }}
                >
                  {breakdown.formulaString}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '8px',
                  }}
                >
                  <span style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--forest-950)', fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em' }}>
                    {breakdown.totalFormatted}
                  </span>
                  <span style={{ fontSize: '0.88rem', color: 'var(--forest-700)', fontWeight: 700 }}>
                    kg CO₂ Produced
                  </span>
                </div>
              </div>
            </div>

            {/* Pinned Action Footer */}
            <div className="modal-footer">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                style={{ flex: '1 1 100px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  flex: '2 1 200px',
                  padding: '12px 20px',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(13, 40, 24, 0.25)',
                }}
              >
                <CheckCircle2 size={17} />
                <span>{editingActivity ? 'UPDATE ACTIVITY' : 'ADD ACTIVITY'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Decision Point 2 Anomaly Interceptor Dialog */}
      {pendingAbsurd && (
        <AbsurdInputModal
          isOpen={true}
          activityType={pendingAbsurd.type}
          quantity={pendingAbsurd.quantity}
          reason={pendingAbsurd.reason}
          onConfirmAnyway={handleConfirmAnyway}
          onEditEntry={handleEditEntry}
        />
      )}
    </>
  );
};
