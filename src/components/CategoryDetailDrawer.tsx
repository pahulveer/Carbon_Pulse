import React, { useEffect, useRef } from 'react';
import {
  X,
  ArrowRight,
  Plus,
  Car,
  Bus,
  Plane,
  Zap,
  Salad,
  Beef,
  Trash2,
  Edit2,
  PieChart,
} from 'lucide-react';
import type { ActivityCategory, ActivityLog, ActivityType, WeekMetrics } from '../types';
import { ACTIVITY_DEFINITIONS } from '../lib/emissions';
import { formatDateDisplay } from '../lib/weekUtils';
import { getCategoryActivitiesForWeek } from '../lib/intelligence';

interface CategoryDetailDrawerProps {
  isOpen: boolean;
  category: ActivityCategory | null;
  metrics: WeekMetrics;
  allActivities: ActivityLog[];
  onClose: () => void;
  onOpenLogModal: (initialType?: ActivityType) => void;
  onEditActivity: (activity: ActivityLog) => void;
  onDeleteActivity: (id: string) => void;
  onViewInHistory: (category: ActivityCategory) => void;
}

const CATEGORY_ICONS: Record<ActivityCategory, React.ReactNode> = {
  transport: <Car size={20} />,
  energy: <Zap size={20} />,
  food: <Salad size={20} />,
};

const ICONS_MAP: Record<ActivityType, React.ReactNode> = {
  car: <Car size={16} />,
  bus: <Bus size={16} />,
  flight: <Plane size={16} />,
  electricity: <Zap size={16} />,
  veg_meal: <Salad size={16} />,
  non_veg_meal: <Beef size={16} />,
};

export const CategoryDetailDrawer: React.FC<CategoryDetailDrawerProps> = ({
  isOpen,
  category,
  metrics,
  allActivities,
  onClose,
  onOpenLogModal,
  onEditActivity,
  onDeleteActivity,
  onViewInHistory,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // Focus close button on open
      setTimeout(() => closeButtonRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !category) return null;

  const categoryMeta = metrics.categoryTotals.find((c) => c.category === category);
  const categoryColor = categoryMeta?.color || 'var(--emerald-400)';
  const categoryLabel = categoryMeta?.label || category;

  // Filter activities strictly belonging to this category in the current week
  const categoryActivities = getCategoryActivitiesForWeek(
    allActivities,
    category,
    metrics.weekStart,
    metrics.weekEnd
  );

  const defaultTypeForCategory: ActivityType =
    category === 'transport' ? 'car' : category === 'energy' ? 'electricity' : 'veg_meal';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-drawer-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(18, 38, 28, 0.45)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          transition: 'opacity 0.25s ease',
        }}
      />

      {/* Slide-over Drawer Panel */}
      <div
        ref={drawerRef}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '480px',
          height: '100%',
          background: '#ffffff',
          borderLeft: `2px solid ${categoryColor}`,
          boxShadow: 'var(--shadow-floating)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1001,
          animation: 'drawerSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: `${categoryColor}18`,
                border: `1px solid ${categoryColor}40`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: categoryColor,
              }}
            >
              {CATEGORY_ICONS[category]}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3
                  id="category-drawer-title"
                  style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--forest-950)', letterSpacing: '-0.01em' }}
                >
                  {categoryLabel}
                </h3>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: `${categoryColor}20`,
                    color: categoryColor,
                    border: `1px solid ${categoryColor}50`,
                  }}
                >
                  {categoryMeta ? `${categoryMeta.percentage}% of Week` : '0%'}
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {metrics.weekRangeFormatted}
              </p>
            </div>
          </div>

          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="btn btn-secondary btn-icon"
            aria-label="Close detail drawer"
            style={{ width: '34px', height: '34px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Telemetry Summary Cards */}
        <div
          style={{
            padding: '16px 24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
            background: 'rgba(27, 67, 50, 0.04)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div
            style={{
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              background: '#ffffff',
              border: '1px solid var(--border-subtle)',
              textAlign: 'center',
              boxShadow: 'var(--shadow-subtle)',
            }}
          >
            <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: categoryColor }}>
              {categoryMeta ? categoryMeta.totalCo2.toFixed(1) : '0.0'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>kg CO₂ Total</div>
          </div>

          <div
            style={{
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              background: '#ffffff',
              border: '1px solid var(--border-subtle)',
              textAlign: 'center',
              boxShadow: 'var(--shadow-subtle)',
            }}
          >
            <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--forest-950)' }}>
              {categoryActivities.length}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {categoryActivities.length === 1 ? 'Activity' : 'Activities'}
            </div>
          </div>

          <div
            style={{
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              background: '#ffffff',
              border: '1px solid var(--border-subtle)',
              textAlign: 'center',
              boxShadow: 'var(--shadow-subtle)',
            }}
          >
            <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
              {categoryActivities.length > 0 && categoryMeta
                ? (categoryMeta.totalCo2 / categoryActivities.length).toFixed(1)
                : '0.0'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>kg Avg / Log</div>
          </div>
        </div>

        {/* Scrollable Activities Feed */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
              Itemized Records ({categoryActivities.length})
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
              Sorted by date
            </span>
          </div>

          {categoryActivities.length === 0 ? (
            <div
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 'var(--radius-md)',
                border: '1px dashed var(--border-subtle)',
                marginTop: '10px',
              }}
            >
              <PieChart size={32} color={categoryColor} style={{ margin: '0 auto 12px auto' }} />
              <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '6px' }}>
                NO ACTIVITIES IN THIS CATEGORY
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
                Nothing has been logged for {categoryLabel.toLowerCase()} in the current week.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenLogModal(defaultTypeForCategory);
                }}
                className="btn btn-primary btn-sm"
              >
                <Plus size={15} />
                <span>Log {categoryLabel} Activity</span>
              </button>
            </div>
          ) : (
            categoryActivities.map((act) => {
              const def = ACTIVITY_DEFINITIONS[act.type] || ACTIVITY_DEFINITIONS.car;
              return (
                <div
                  key={act.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: '#ffffff',
                    border: '1px solid var(--border-subtle)',
                    boxShadow: 'var(--shadow-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    transition: 'border-color var(--transition-fast), transform var(--transition-fast)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        background: `${categoryColor}15`,
                        color: categoryColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {ICONS_MAP[act.type]}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--forest-950)' }}>
                          {def.label}
                        </span>
                        {act.flaggedAsAbsurd && (
                          <span className="badge badge-amber" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>
                            Flagged
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {act.quantity} {act.unit} • {formatDateDisplay(act.date)}
                        {act.notes ? ` • ${act.notes}` : ''}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.95rem', color: categoryColor }}>
                        {act.co2Kg.toFixed(2)} kg
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                        @{act.factor} kg/{act.unit}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button
                        onClick={() => {
                          onClose();
                          onEditActivity(act);
                        }}
                        title="Edit entry"
                        aria-label={`Edit ${def.label}`}
                        className="btn btn-secondary btn-icon"
                        style={{ width: '30px', height: '30px' }}
                      >
                        <Edit2 size={13} />
                      </button>

                      <button
                        onClick={() => onDeleteActivity(act.id)}
                        title="Delete entry"
                        aria-label={`Delete ${def.label}`}
                        className="btn btn-secondary btn-icon"
                        style={{ width: '30px', height: '30px' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--rose-400)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Action Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'rgba(8, 12, 22, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
          }}
        >
          <button
            onClick={() => {
              onClose();
              onViewInHistory(category);
            }}
            className="btn btn-secondary btn-sm"
            style={{ flex: 1 }}
          >
            <span>View in History</span>
            <ArrowRight size={14} />
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenLogModal(defaultTypeForCategory);
            }}
            className="btn btn-primary btn-sm"
            style={{ flex: 1 }}
          >
            <Plus size={15} />
            <span>Log {categoryLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
