import React, { useState } from 'react';
import { Leaf, Plus } from 'lucide-react';
import type { ActivityLog, WeekMetrics } from '../../types';
import { HeroParticleLayer } from './HeroParticleLayer';
import { HeroTelemetryCard } from './HeroTelemetryCard';
import { HeroBreakdownCard } from './HeroBreakdownCard';

interface HeroDioramaProps {
  metrics: WeekMetrics;
  activities: ActivityLog[];
  onStartTracking: () => void;
}

export const HeroDiorama: React.FC<HeroDioramaProps> = ({
  metrics,
  activities,
  onStartTracking,
}) => {
  const [isTouchDevice] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches
    );
  });
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 6;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -6;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const weeklyActivityCount = metrics.dailyTotals.reduce((sum, d) => sum + d.activityCount, 0);

  return (
    <div
      className="hero-diorama-container"
      style={{
        position: 'relative',
        perspective: '1200px',
        minHeight: '520px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 3D Frame */}
      <div
        className="hero-diorama-frame"
        style={{
          position: 'relative',
          width: '100%',
          height: '520px',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-floating)',
          border: '1px solid rgba(255, 255, 255, 0.95)',
          transform: isTouchDevice ? 'none' : `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
          transition: isTouchDevice ? 'none' : 'transform 0.18s ease-out',
        }}
      >
        {/* Background 3D Nature Architecture Image */}
        <img
          src={`${import.meta.env.BASE_URL}hero_landscape.jpg`}
          alt="Sustainable environmental architecture surrounded by forest, waterways, and solar canopy"
          loading="eager"
          decoding="async"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 42%',
          }}
        />

        {/* Ambient Particle Layer */}
        <HeroParticleLayer />

        {/* Subtle contrast gradient */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 50% 50%, transparent 40%, rgba(13, 40, 24, 0.16) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Top-Left Telemetry Card (Real Footprint) */}
        <HeroTelemetryCard metrics={metrics} activities={activities} />

        {/* Top-Right Telemetry Card (Real Breakdown) */}
        <HeroBreakdownCard metrics={metrics} />

        {/* Bottom Left Real Activity Pill */}
        <div
          className="glass-float-card hero-status-pill"
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '24px',
            padding: '10px 16px',
            borderRadius: 'var(--radius-pill)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 2,
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--forest-800)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <Leaf size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--forest-950)', fontFamily: 'var(--font-mono)' }}>
              {weeklyActivityCount} {weeklyActivityCount === 1 ? 'Activity' : 'Activities'}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              Recorded This Week
            </div>
          </div>
          <button
            type="button"
            onClick={onStartTracking}
            aria-label="Log an activity now"
            title="Log an activity now"
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: 'rgba(27, 67, 50, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--forest-800)',
              cursor: 'pointer',
              marginLeft: '4px',
            }}
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Subtle Architectural Typography Branding on Diorama */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '28px',
            right: '280px',
            textAlign: 'right',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.62rem',
            letterSpacing: '0.12em',
            color: 'rgba(255, 255, 255, 0.9)',
            textShadow: '0 1px 4px rgba(0, 0, 0, 0.35)',
            lineHeight: 1.5,
            pointerEvents: 'none',
          }}
          className="diorama-motto"
        >
          OUR PLANET<br />
          OUR RESPONSIBILITY
        </div>
      </div>
    </div>
  );
};
