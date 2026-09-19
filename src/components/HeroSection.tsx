import React, { useState } from 'react';
import type { ActivityLog, WeekMetrics } from '../types';
import { HeroCopy } from './hero/HeroCopy';
import { HeroStepRail } from './hero/HeroStepRail';
import { HeroDiorama } from './hero/HeroDiorama';

interface HeroSectionProps {
  metrics: WeekMetrics;
  activities: ActivityLog[];
  onStartTracking: () => void;
  onWatchDemo: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  metrics,
  activities,
  onStartTracking,
  onWatchDemo,
}) => {
  const [activeStep, setActiveStep] = useState<'01' | '02' | '03' | '04'>('01');

  return (
    <section
      id="home"
      aria-label="Hero Overview"
      style={{
        position: 'relative',
        marginTop: '12px',
        marginBottom: '24px',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 1.45fr)',
          gap: '40px',
          alignItems: 'center',
          position: 'relative',
        }}
        className="hero-grid-responsive"
      >
        {/* Left Column: Rail + Editorial Content */}
        <div style={{ position: 'relative' }}>
          <HeroStepRail activeStep={activeStep} onStepClick={setActiveStep} />
          <HeroCopy onStartTracking={onStartTracking} onWatchDemo={onWatchDemo} />
        </div>

        {/* Right Column: Interactive 3D Nature Diorama */}
        <HeroDiorama
          metrics={metrics}
          activities={activities}
          onStartTracking={onStartTracking}
        />
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .hero-grid-responsive {
            grid-template-columns: 1fr !important;
            gap: 28px !important;
          }
          .hero-rail-steps {
            display: none !important;
          }
        }
        @media (max-width: 768px) {
          .hero-diorama-frame {
            height: 480px !important;
          }
          .hero-telemetry-card {
            width: calc(100% - 32px) !important;
            left: 16px !important;
            top: 16px !important;
          }
          .hero-breakdown-card {
            display: none !important;
          }
          .hero-status-pill {
            left: 16px !important;
            bottom: 16px !important;
          }
          .diorama-motto {
            display: none !important;
          }
        }
        @media (max-width: 480px) {
          .hero-diorama-frame {
            height: 440px !important;
            border-radius: var(--radius-lg) !important;
          }
        }
      `}</style>
    </section>
  );
};
