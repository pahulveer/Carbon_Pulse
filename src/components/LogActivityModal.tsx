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
                <Calculator size={18} />
              </div>
              <div>
                <h2 id="modal-log-title" style={{ fontSize: '1.12rem', fontWeight: 800 }}>
                  {editingActivity ? 'Edit Carbon Activity' : 'Log Carbon Activity'}
                </h2>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
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
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Step 1: Activity Type Selection */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: 'var(--text-secondary)',
                    marginBottom: '8px',
                  }}
                >
                  1. Select Activity Type
                </label>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '8px',
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
                          padding: '8px 6px',
                          borderRadius: 'var(--radius-md)',
                          background: isSelected
                            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(56, 189, 248, 0.1) 100%)'
                            : 'rgba(12, 19, 32, 0.8)',
                          border: isSelected ? '1.5px solid var(--emerald-400)' : '1px solid var(--border-subtle)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                          textAlign: 'center',
                          boxShadow: isSelected ? '0 2px 8px -2px rgba(0, 0, 0, 0.4), inset 0 0 10px -2px rgba(16, 185, 129, 0.35)' : 'none',
                          overflow: 'hidden',
                          transition: 'all var(--transition-fast)',
                          cursor: 'pointer',
                        }}
                      >
                        <div
                          style={{
                            color: isSelected ? 'var(--emerald-400)' : 'var(--text-secondary)',
                          }}
                        >
                          {ICONS_MAP[typeKey]}
                        </div>
                        <span
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: isSelected ? 700 : 500,
                            color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                            lineHeight: 1.2,
                          }}
                        >
                          {def.label}
                        </span>
                        <span
                          style={{
                            fontSize: '0.67rem',
                            fontFamily: 'var(--font-mono)',
                            color: isSelected ? 'var(--emerald-400)' : 'var(--text-muted)',
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
                    marginBottom: '6px',
                  }}
                >
                  <label
                    htmlFor="activity-qty-input"
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    2. Enter Quantity ({currentDef.unit})
                  </label>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Unit: <strong>{currentDef.unitLabelPlural}</strong>
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
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        padding: '10px 14px',
                        background: 'rgba(8, 14, 25, 0.9)',
                        borderColor: qtyError ? 'var(--rose-400)' : undefined,
                      }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        right: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: 'var(--emerald-400)',
                        pointerEvents: 'none',
                      }}
                    >
                      {currentDef.unit}
                    </span>
                  </div>
                </div>

                {qtyError && (
                  <div style={{ marginTop: '5px', fontSize: '0.78rem', color: 'var(--rose-400)', fontWeight: 500 }}>
                    {qtyError}
                  </div>
                )}

                {/* Quick Preset Buttons */}
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginRight: '4px' }}>
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
                        className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                        style={{
                          padding: '3px 9px',
                          fontSize: '0.74rem',
                          fontWeight: isActive ? 700 : 500,
                          background: isActive ? 'rgba(16, 185, 129, 0.22)' : undefined,
                          borderColor: isActive ? 'var(--emerald-400)' : undefined,
                          color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
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
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: 'var(--text-secondary)',
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
                      padding: '8px 12px',
                      fontFamily: 'var(--font-mono)',
                      background: 'rgba(8, 14, 25, 0.9)',
                      fontSize: '0.85rem',
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
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: 'var(--text-secondary)',
                      marginBottom: '6px',
                    }}
                  >
                    4. Note (Optional)
                  </label>
                  <input
                    id="activity-notes-input"
                    type="text"
                    placeholder="e.g. Daily commute"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    maxLength={80}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'rgba(8, 14, 25, 0.9)',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>
              </div>

              {/* Transparent Calculation Preview Box */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(14, 24, 42, 0.85) 100%)',
                  border: '1px solid rgba(52, 211, 153, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '4px',
                  }}
                >
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--emerald-400)', fontWeight: 700 }}>
                    Live Conversion Preview
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Factor: {currentDef.factor.toFixed(2)} kg/{currentDef.unit}
                  </span>
                </div>

                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.88rem',
                    color: 'var(--text-primary)',
                    marginBottom: '4px',
                  }}
                >
                  {breakdown.formulaString}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '6px',
                  }}
                >
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF', fontFamily: 'var(--font-mono)' }}>
                    {breakdown.totalFormatted}
                  </span>
                  <span style={{ fontSize: '0.88rem', color: 'var(--emerald-400)', fontWeight: 600 }}>
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
                  padding: '10px 20px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.35)',
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
