import React from 'react';

interface HeroStepRailProps {
  activeStep: '01' | '02' | '03' | '04';
  onStepClick: (step: '01' | '02' | '03' | '04') => void;
}

export const HeroStepRail: React.FC<HeroStepRailProps> = ({ activeStep, onStepClick }) => {
  const steps: Array<'01' | '02' | '03' | '04'> = ['01', '02', '03', '04'];

  return (
    <nav
      aria-label="Workflow progress steps"
      style={{
        position: 'absolute',
        left: '-36px',
        top: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        fontSize: '0.74rem',
        fontFamily: 'var(--font-mono)',
        color: 'var(--text-muted)',
      }}
      className="hero-rail-steps"
    >
      {steps.map((step) => {
        const isActive = activeStep === step;
        return (
          <button
            key={step}
            type="button"
            onClick={() => onStepClick(step)}
            aria-current={isActive ? 'step' : undefined}
            style={{
              fontWeight: isActive ? 700 : 400,
              color: isActive ? 'var(--forest-800)' : 'var(--text-dim)',
              borderLeft: isActive ? '2px solid var(--forest-800)' : '2px solid transparent',
              paddingLeft: '6px',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            {step}
          </button>
        );
      })}
    </nav>
  );
};
