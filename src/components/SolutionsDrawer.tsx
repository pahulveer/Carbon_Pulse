import React, { useEffect, useRef } from 'react';
import { X, Sparkles, Car, Salad, Zap, ArrowRight } from 'lucide-react';
import type { ActivityType } from '../types';

interface SolutionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction?: (activityType: ActivityType) => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
}

interface Pathway {
  title: string;
  factorContext: string;
  guidance: string;
  actionType: ActivityType;
  actionLabel: string;
}

const PATHWAYS: { category: string; icon: React.ReactNode; color: string; items: Pathway[] }[] = [
  {
    category: 'TRANSPORT',
    icon: <Car size={18} />,
    color: '#245A42',
    items: [
      {
        title: 'Active & Municipal Transit Shift',
        factorContext: '0.08 kg CO₂/km (Bus) vs 0.20 kg CO₂/km (Solo Car)',
        guidance: 'Shifting 3 medium commutes per week from personal car to electric or hybrid municipal bus eliminates up to 60% of commuting emissions.',
        actionType: 'bus',
        actionLabel: 'Log Bus Trip',
      },
      {
        title: 'High-Speed Rail over Domestic Flight',
        factorContext: '0.25 kg CO₂/km for regional aviation legs',
        guidance: 'Aviation creates high radiative forcing per passenger-km. Replacing regional short-haul flights with rail or virtual meetings preserves your carbon budget.',
        actionType: 'flight',
        actionLabel: 'Audit Flight Distance',
      },
    ],
  },
  {
    category: 'FOOD & NUTRITION',
    icon: <Salad size={18} />,
    color: '#40916C',
    items: [
      {
        title: 'Plant-Forward Diet Substitution',
        factorContext: '0.50 kg CO₂ (Veg Meal) vs 2.00 kg CO₂ (Non-Veg Meal)',
        guidance: 'Livestock and feed conversion are carbon-intensive. Swapping 4 meals per week to legumes, whole grains, and seasonal vegetables saves ~6.0 kg CO₂ weekly.',
        actionType: 'veg_meal',
        actionLabel: 'Log Plant-Based Meal',
      },
    ],
  },
  {
    category: 'HOUSEHOLD ENERGY',
    icon: <Zap size={18} />,
    color: '#0284C7',
    items: [
      {
        title: 'Vampire Load & Smart Temperature Setback',
        factorContext: '0.80 kg CO₂ per kWh consumed',
        guidance: 'Adjusting HVAC thermostats by 1-2°C and eliminating phantom standby loads from electronics conserves kilowatt-hours directly on the municipal grid.',
        actionType: 'electricity',
        actionLabel: 'Log Electricity Usage',
      },
    ],
  },
];

export const SolutionsDrawer: React.FC<SolutionsDrawerProps> = ({
  isOpen,
  onClose,
  onSelectAction,
  triggerRef,
}) => {
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  // Focus trap & Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const triggerEl = triggerRef?.current;

    // Focus close button initially
    const timeout = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 40);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      if (triggerEl) {
        triggerEl.focus();
      }
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="solutions-drawer-title"
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
          background: 'rgba(13, 40, 24, 0.45)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          animation: 'fadeIn 0.2s ease-out',
        }}
      />

      {/* Slide-over Drawer */}
      <div
        ref={drawerRef}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '520px',
          height: '100%',
          background: 'var(--bg-surface)',
          borderLeft: '2px solid var(--forest-700)',
          boxShadow: 'var(--shadow-floating)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1001,
          animation: 'drawerSlideIn 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface-soft)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(36, 90, 66, 0.12)',
                color: 'var(--forest-800)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <h2
                id="solutions-drawer-title"
                style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--forest-950)' }}
              >
                Climate Action Solutions
              </h2>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Empirical reduction pathways grounded in DEFRA & IPCC conversion factors
              </p>
            </div>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="btn btn-secondary btn-icon"
            aria-label="Close solutions drawer"
            style={{ width: '36px', height: '36px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body */}
        <div
          style={{
            padding: '24px',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          {PATHWAYS.map((cat) => (
            <section key={cat.category} aria-labelledby={`cat-${cat.category}`}>
              <div
                id={`cat-${cat.category}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.08em',
                  color: cat.color,
                }}
              >
                {cat.icon}
                <span>{cat.category}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {cat.items.map((item) => (
                  <div
                    key={item.title}
                    style={{
                      padding: '16px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      boxShadow: 'var(--shadow-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--forest-950)' }}>
                      {item.title}
                    </div>

                    <div
                      style={{
                        fontSize: '0.74rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--forest-700)',
                        background: 'var(--bg-surface-soft)',
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-sm)',
                        alignSelf: 'flex-start',
                      }}
                    >
                      {item.factorContext}
                    </div>

                    <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                      {item.guidance}
                    </p>

                    {onSelectAction && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onSelectAction(item.actionType);
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{
                          alignSelf: 'flex-start',
                          marginTop: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: 'var(--forest-800)',
                          fontWeight: 700,
                        }}
                      >
                        <span>{item.actionLabel}</span>
                        <ArrowRight size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Drawer Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface-soft)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            ESC to close
          </span>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-primary btn-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
