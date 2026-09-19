import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  Target,
  Sliders,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface DemoToolbarProps {
  onLoadScenario: (scenario: 'balanced' | 'exceeded' | 'empty') => void;
  onTriggerAbsurdDemo: () => void;
  onOpenTargetModal: () => void;
}

export const DemoToolbar: React.FC<DemoToolbarProps> = ({
  onLoadScenario,
  onTriggerAbsurdDemo,
  onOpenTargetModal,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside
      aria-label="Evaluation Scenarios"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 90,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '8px',
      }}
    >
      {/* Expanded Scenario Panel */}
      {isExpanded && (
        <div
          className="glass-card"
          style={{
            padding: '12px 14px',
            background: '#ffffff',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(27, 67, 50, 0.15)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-floating)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            width: '260px',
            animation: 'fadeIn 0.18s ease-out',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '8px',
              fontSize: '0.74rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span>Judge Demo Fixtures</span>
            <button
              onClick={() => setIsExpanded(false)}
              aria-label="Close demo panel"
              style={{ color: 'var(--text-dim)', padding: '2px' }}
            >
              <ChevronDown size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              onClick={() => {
                onLoadScenario('balanced');
                setIsExpanded(false);
              }}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start', padding: '6px 10px', fontSize: '0.8rem' }}
            >
              <CheckCircle2 size={14} color="var(--emerald-400)" />
              <span>Standard Week (On Pace)</span>
            </button>

            <button
              onClick={() => {
                onLoadScenario('exceeded');
                setIsExpanded(false);
              }}
              className="btn btn-secondary btn-sm"
              style={{
                justifyContent: 'flex-start',
                padding: '6px 10px',
                fontSize: '0.8rem',
                borderColor: 'rgba(244, 63, 94, 0.3)',
              }}
            >
              <AlertCircle size={14} color="var(--rose-400)" />
              <span>DP1: Target Exceeded Nudge</span>
            </button>

            <button
              onClick={() => {
                onTriggerAbsurdDemo();
                setIsExpanded(false);
              }}
              className="btn btn-secondary btn-sm"
              style={{
                justifyContent: 'flex-start',
                padding: '6px 10px',
                fontSize: '0.8rem',
                borderColor: 'rgba(245, 158, 11, 0.3)',
              }}
            >
              <AlertTriangle size={14} color="var(--amber-400)" />
              <span>DP2: Absurd Input (500k km)</span>
            </button>

            <button
              onClick={() => {
                onOpenTargetModal();
                setIsExpanded(false);
              }}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start', padding: '6px 10px', fontSize: '0.8rem' }}
            >
              <Target size={14} color="var(--sky-400)" />
              <span>Configure Weekly Target</span>
            </button>

            <button
              onClick={() => {
                onLoadScenario('empty');
                setIsExpanded(false);
              }}
              className="btn btn-secondary btn-sm"
              style={{
                justifyContent: 'flex-start',
                padding: '6px 10px',
                fontSize: '0.8rem',
                color: 'var(--text-dim)',
              }}
            >
              <RotateCcw size={14} />
              <span>Reset State to Blank</span>
            </button>
          </div>
        </div>
      )}

      {/* Discrete Corner Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="btn btn-secondary btn-sm"
        style={{
          borderRadius: 'var(--radius-full)',
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(27, 67, 50, 0.18)',
          boxShadow: 'var(--shadow-floating)',
          padding: '7px 14px',
          fontSize: '0.78rem',
          fontWeight: 600,
          color: 'var(--forest-950)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
        title="Quick demo test fixtures for hackathon evaluation"
      >
        <Sliders size={14} color="var(--forest-800)" />
        <span>Judge Demo Fixtures</span>
        {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>
    </aside>
  );
};
