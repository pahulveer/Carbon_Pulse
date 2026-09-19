import React from 'react';
import { X, Sparkles, Zap, Bike, Salad, Home, ArrowRight } from 'lucide-react';

interface SolutionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction?: (activityType: string) => void;
}

export const SolutionsModal: React.FC<SolutionsModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  if (!isOpen) return null;

  const solutions = [
    {
      category: 'Mobility',
      icon: <Bike size={20} />,
      title: 'Electrified & Active Transit',
      impact: '-68% per commute',
      description: 'Switching 3 car commutes per week to cycling or electrified bus avoids ~14.2 kg CO₂ weekly.',
      actionType: 'bus',
      buttonText: 'Log Clean Commute',
    },
    {
      category: 'Nutrition',
      icon: <Salad size={20} />,
      title: 'Plant-Rich Meal Planning',
      impact: '-4.6 kg CO₂ / meal',
      description: 'Replacing 2 red-meat meals with nourishing plant-based dishes saves more carbon than skipping a flight leg.',
      actionType: 'veg_meal',
      buttonText: 'Log Plant-Based Meal',
    },
    {
      category: 'Energy',
      icon: <Zap size={20} />,
      title: 'Smart Thermostat & Off-Peak Power',
      impact: '-25% power draw',
      description: 'Optimizing HVAC schedules and vampire loads reduces residential emissions by ~35 kg CO₂ monthly.',
      actionType: 'electricity',
      buttonText: 'Log Household Power',
    },
    {
      category: 'Circular Living',
      icon: <Home size={20} />,
      title: 'Durable Goods & Local Sourcing',
      impact: 'Up to -180 kg CO₂ / year',
      description: 'Prioritizing repairs, second-hand electronics, and seasonal local produce halts supply-chain emissions.',
      actionType: 'car',
      buttonText: 'Log Low-Carbon Choice',
    },
  ];

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="solutions-title">
      <div className="modal-dialog" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
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
              <Sparkles size={18} />
            </div>
            <div>
              <h2 id="solutions-title" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--forest-950)' }}>
                Personal Climate Solutions
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                High-leverage pathways to systematically reduce your weekly emissions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-icon"
            aria-label="Close solutions modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              padding: '14px 18px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(45, 106, 79, 0.08)',
              border: '1px solid rgba(45, 106, 79, 0.18)',
              fontSize: '0.86rem',
              color: 'var(--forest-900)',
              lineHeight: 1.5,
            }}
          >
            <strong>Science-Grounded Reduction Strategy:</strong> We prioritize actions that yield the greatest immediate reductions without degrading everyday quality of life.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {solutions.map((sol, index) => (
              <div
                key={index}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-lg)',
                  background: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: 'rgba(27, 67, 50, 0.07)',
                        color: 'var(--forest-800)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {sol.icon}
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        {sol.category}
                      </span>
                      <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--forest-950)' }}>
                        {sol.title}
                      </h3>
                    </div>
                  </div>
                  <span className="badge badge-emerald" style={{ fontSize: '0.74rem' }}>
                    {sol.impact}
                  </span>
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  {sol.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
                  <button
                    onClick={() => {
                      onClose();
                      onSelectAction?.(sol.actionType);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <span>{sol.buttonText}</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Data verified via IPCC AR6 & UK DEFRA standards
          </span>
          <button onClick={onClose} className="btn btn-primary btn-sm">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
