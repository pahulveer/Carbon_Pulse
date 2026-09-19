import React from 'react';
import { ArrowRight, Play, ChevronDown } from 'lucide-react';

interface HeroCopyProps {
  onStartTracking: () => void;
  onWatchDemo: () => void;
}

export const HeroCopy: React.FC<HeroCopyProps> = ({ onStartTracking, onWatchDemo }) => {
  return (
    <div
      style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      {/* Overline */}
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.78rem',
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--forest-700)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span>TRACK</span>
        <span style={{ color: 'var(--text-dim)' }} aria-hidden="true">›</span>
        <span>UNDERSTAND</span>
        <span style={{ color: 'var(--text-dim)' }} aria-hidden="true">›</span>
        <span>REDUCE</span>
      </div>

      {/* Architectural Big Headline */}
      <h1
        style={{
          fontSize: 'clamp(2.5rem, 5.2vw, 4.6rem)',
          lineHeight: 1.05,
          fontWeight: 800,
          color: 'var(--forest-950)',
          letterSpacing: '-0.035em',
        }}
      >
        A Cleaner<br />
        Tomorrow<br />
        Starts{' '}
        <span
          style={{
            color: 'var(--forest-600)',
            fontStyle: 'normal',
            position: 'relative',
            display: 'inline-block',
          }}
        >
          Today.
        </span>
      </h1>

      {/* Description */}
      <p
        style={{
          fontSize: '1.05rem',
          lineHeight: 1.65,
          color: 'var(--text-secondary)',
          maxWidth: '460px',
          fontFamily: 'var(--font-body)',
        }}
      >
        Carbon Pulse transforms your daily mobility, energy, and nutrition choices into
        transparent weekly climate intelligence with zero-surveillance local privacy.
      </p>

      {/* CTA Buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          marginTop: '6px',
        }}
      >
        <button
          type="button"
          onClick={onStartTracking}
          className="btn btn-primary btn-lg"
          style={{
            padding: '14px 28px',
            fontSize: '0.98rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span>Start Tracking</span>
          <ArrowRight size={18} />
        </button>

        <button
          type="button"
          onClick={onWatchDemo}
          className="btn btn-secondary btn-lg"
          style={{
            padding: '14px 24px',
            fontSize: '0.96rem',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'var(--forest-800)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <Play size={11} fill="#ffffff" style={{ marginLeft: '1px' }} />
          </div>
          <span>Watch Demo</span>
        </button>
      </div>

      {/* Scroll to explore hint */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginTop: '20px',
          color: 'var(--text-muted)',
          fontSize: '0.74rem',
          fontFamily: 'var(--font-mono)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        <span>SCROLL TO EXPLORE</span>
        <ChevronDown size={14} />
      </div>
    </div>
  );
};
