import React, { useState } from 'react';
import { X, Search, ArrowRight, Car, Bus, Plane, Zap, Salad, Beef } from 'lucide-react';
import type { ActivityType } from '../types';
import { ACTIVITY_DEFINITIONS, EMISSION_FACTORS } from '../lib/emissions';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectActivity: (type: ActivityType) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectActivity,
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const activityTypes: ActivityType[] = ['car', 'bus', 'flight', 'electricity', 'veg_meal', 'non_veg_meal'];

  const iconMap: Record<ActivityType, React.ReactNode> = {
    car: <Car size={16} />,
    bus: <Bus size={16} />,
    flight: <Plane size={16} />,
    electricity: <Zap size={16} />,
    veg_meal: <Salad size={16} />,
    non_veg_meal: <Beef size={16} />,
  };

  const filtered = activityTypes.filter((type) => {
    const def = ACTIVITY_DEFINITIONS[type];
    const q = query.toLowerCase();
    return def.label.toLowerCase().includes(q) || def.category.toLowerCase().includes(q) || type.includes(q);
  });

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="search-modal-title">
      <div className="modal-dialog" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
        {/* Search Input Bar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Search size={18} color="var(--forest-700)" />
          <input
            id="search-modal-title"
            type="text"
            placeholder="Search activities, categories, or emission factors..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontSize: '1rem',
              color: 'var(--text-primary)',
              padding: 0,
              boxShadow: 'none',
            }}
          />
          <button onClick={onClose} className="btn btn-secondary btn-icon" style={{ width: '32px', height: '32px' }} aria-label="Close search">
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        <div className="modal-body" style={{ maxHeight: '340px', padding: '12px' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', padding: '0 8px' }}>
            Available Activities ({filtered.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {filtered.map((type) => {
              const def = ACTIVITY_DEFINITIONS[type];
              const factor = EMISSION_FACTORS[type];
              return (
                <div
                  key={type}
                  onClick={() => {
                    onSelectActivity(type);
                    onClose();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(45, 106, 79, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: 'rgba(27, 67, 50, 0.08)',
                        color: 'var(--forest-800)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {iconMap[type]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--forest-950)' }}>
                        {def.label}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Category: {def.category} • Factor: {factor} kg CO₂ / {def.unit}
                      </div>
                    </div>
                  </div>

                  <ArrowRight size={15} color="var(--forest-700)" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Press Esc to close
          </span>
          <span style={{ fontSize: '0.74rem', color: 'var(--forest-800)', fontWeight: 600 }}>
            Click an activity to log immediately
          </span>
        </div>
      </div>
    </div>
  );
};
