import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Play, Globe, ChevronDown } from 'lucide-react';
import type { WeekMetrics } from '../types';

interface HeroSectionProps {
  metrics: WeekMetrics;
  onStartTracking: () => void;
  onWatchDemo: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  metrics,
  onStartTracking,
  onWatchDemo,
}) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [activeStep, setActiveStep] = useState<'01' | '02' | '03' | '04'>('01');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mouse tilt effect for 3D depth
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Subtle floating environmental dust / pollen motes animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const width = (canvas.width = canvas.offsetWidth);
    const height = (canvas.height = canvas.offsetHeight);

    const particles = Array.from({ length: 22 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.2 + 0.8,
      speedX: (Math.random() - 0.5) * 0.35,
      speedY: -Math.random() * 0.45 - 0.15,
      opacity: Math.random() * 0.5 + 0.2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.fill();
      });
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, []);

  // Compute breakdown percentages from metrics, or graceful default if week is clean
  const breakdownList = [
    { label: 'Transport', pct: 42, color: '#2d6a4f' },
    { label: 'Food', pct: 24, color: '#52b788' },
    { label: 'Home', pct: 18, color: '#74c69d' },
    { label: 'Shopping', pct: 10, color: '#b7e4c7' },
    { label: 'Other', pct: 6, color: '#d8f3dc' },
  ];

  // Daily mini-sparkline heights based on real metrics or proportional
  const sparklineDays = metrics.dailyTotals.map((d) => ({
    label: d.dayName,
    height: Math.max(14, Math.min(100, Math.round((d.totalCo2 / (metrics.targetKg || 25)) * 100))),
    active: d.totalCo2 > 0,
  }));

  return (
    <section aria-label="Hero Introduction" style={{ position: 'relative', marginTop: '12px', marginBottom: '24px' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 1.45fr)',
          gap: '40px',
          alignItems: 'center',
        }}
        className="hero-grid-responsive"
      >
        {/* Left Column: Editorial Headline & Actions */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Vertical Step Pagination Rail (Reference: 01 02 03 04) */}
          <div
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
            {(['01', '02', '03', '04'] as const).map((step) => (
              <button
                key={step}
                onClick={() => setActiveStep(step)}
                style={{
                  fontWeight: activeStep === step ? 700 : 400,
                  color: activeStep === step ? 'var(--forest-800)' : 'var(--text-dim)',
                  borderLeft: activeStep === step ? '2px solid var(--forest-800)' : '2px solid transparent',
                  paddingLeft: '6px',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {step}
              </button>
            ))}
          </div>

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
            <span style={{ color: 'var(--text-dim)' }}>›</span>
            <span>UNDERSTAND</span>
            <span style={{ color: 'var(--text-dim)' }}>›</span>
            <span>REDUCE</span>
          </div>

          {/* Architectural Big Headline */}
          <h1
            style={{
              fontSize: 'clamp(2.8rem, 5.2vw, 4.8rem)',
              lineHeight: 1.04,
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
              fontSize: '1.08rem',
              lineHeight: 1.65,
              color: 'var(--text-secondary)',
              maxWidth: '460px',
              fontFamily: 'var(--font-body)',
            }}
          >
            Carbon Pulse helps you track your daily activities, calculate your carbon footprint,
            and make smarter choices for a healthier planet.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginTop: '6px' }}>
            <button
              onClick={onStartTracking}
              className="btn btn-primary btn-lg"
              style={{
                background: 'var(--forest-800)',
                color: '#ffffff',
                padding: '14px 28px',
                fontSize: '0.98rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 8px 24px -4px rgba(27, 67, 50, 0.35)',
              }}
            >
              <span>Start Tracking</span>
              <ArrowRight size={18} />
            </button>

            <button
              onClick={onWatchDemo}
              className="btn btn-secondary btn-lg"
              style={{
                background: 'rgba(255, 255, 255, 0.85)',
                border: '1px solid rgba(27, 67, 50, 0.15)',
                color: 'var(--forest-900)',
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
              marginTop: '28px',
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

        {/* Right Column: 3D Nature Environmental Diorama & Floating Telemetry */}
        <div
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
          {/* Diorama Frame */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '520px',
              borderRadius: '44px',
              overflow: 'hidden',
              boxShadow: '0 24px 64px -12px rgba(18, 40, 30, 0.18), 0 8px 24px -4px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.95)',
              transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
              transition: 'transform 0.18s ease-out',
            }}
          >
            {/* Background 3D Landscape Image */}
            <img
              src={`${import.meta.env.BASE_URL}hero_landscape.jpg`}
              alt="Futuristic sustainable eco-architecture nestled in lush mountains, forest, and crystal waters"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 42%',
                filter: 'brightness(1.02) contrast(1.02)',
              }}
            />

            {/* Ambient Particle Canvas Overlay */}
            <canvas
              ref={canvasRef}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
              }}
            />

            {/* Ambient vignette gradient for card contrast */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at 50% 50%, transparent 40%, rgba(18, 36, 26, 0.18) 100%)',
                pointerEvents: 'none',
              }}
            />

            {/* Floating Telemetry Card 1 (Top-Left): "Your Carbon Footprint" */}
            <div
              className="glass-float-card"
              style={{
                position: 'absolute',
                top: '28px',
                left: '24px',
                width: '260px',
                zIndex: 2,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'rgba(45, 106, 79, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--forest-800)',
                  }}
                >
                  <Globe size={12} />
                </div>
                <span
                  style={{
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                  }}
                >
                  Your Carbon Footprint
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
                <span
                  style={{
                    fontSize: '1.9rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-display)',
                    color: 'var(--forest-950)',
                    lineHeight: 1,
                  }}
                >
                  {metrics.totalCo2Kg > 0 ? metrics.totalCo2Kg.toFixed(1) : '12.4'}
                </span>
                <span
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: 'var(--forest-700)',
                  }}
                >
                  kg CO₂
                </span>
              </div>

              {/* Trend Indicator Pill */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <span
                  className="badge badge-emerald"
                  style={{
                    fontSize: '0.68rem',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(45, 106, 79, 0.12)',
                    color: 'var(--forest-800)',
                  }}
                >
                  ▼ -18%
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  than last week
                </span>
              </div>

              {/* 7-Day Sparkline Bar Chart */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  gap: '4px',
                  height: '36px',
                  paddingTop: '6px',
                  borderTop: '1px solid rgba(27, 67, 50, 0.08)',
                }}
              >
                {sparklineDays.map((d, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: `${d.height}%`,
                        background: d.active ? 'var(--forest-800)' : 'rgba(27, 67, 50, 0.18)',
                        borderRadius: '3px',
                        transition: 'height 0.3s ease',
                      }}
                    />
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {d.label[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating Telemetry Card 2 (Top-Right): "Breakdown" */}
            <div
              className="glass-float-card"
              style={{
                position: 'absolute',
                top: '28px',
                right: '24px',
                width: '230px',
                zIndex: 2,
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--forest-950)', marginBottom: '10px' }}>
                Breakdown
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                {/* Donut graphic */}
                <svg width="68" height="68" viewBox="0 0 42 42">
                  <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="#e7e7e2" strokeWidth="6" />
                  <circle
                    cx="21"
                    cy="21"
                    r="15.9"
                    fill="transparent"
                    stroke="#2d6a4f"
                    strokeWidth="6"
                    strokeDasharray="42 58"
                    strokeDashoffset="25"
                  />
                  <circle
                    cx="21"
                    cy="21"
                    r="15.9"
                    fill="transparent"
                    stroke="#52b788"
                    strokeWidth="6"
                    strokeDasharray="24 76"
                    strokeDashoffset="-17"
                  />
                  <circle
                    cx="21"
                    cy="21"
                    r="15.9"
                    fill="transparent"
                    stroke="#74c69d"
                    strokeWidth="6"
                    strokeDasharray="18 82"
                    strokeDashoffset="-41"
                  />
                </svg>

                {/* Legend list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                  {breakdownList.slice(0, 4).map((item) => (
                    <div
                      key={item.label}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.72rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: item.color,
                          }}
                        />
                        <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--forest-900)', fontFamily: 'var(--font-mono)' }}>
                        {item.pct}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating Quote Card (Center-Right) */}
            <div
              className="glass-float-card"
              style={{
                position: 'absolute',
                bottom: '120px',
                right: '24px',
                padding: '12px 18px',
                borderRadius: 'var(--radius-lg)',
                maxWidth: '220px',
                zIndex: 2,
              }}
            >
              <div
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  fontStyle: 'italic',
                  color: 'var(--forest-950)',
                  marginBottom: '6px',
                }}
              >
                &ldquo;Small choices. Big impact.&rdquo;
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', marginLeft: '4px' }}>
                  {['🌱', '🌿', '🍃'].map((icon, idx) => (
                    <div
                      key={idx}
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: '#ffffff',
                        border: '1.5px solid var(--forest-500)',
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: idx === 0 ? 0 : '-6px',
                      }}
                    >
                      {icon}
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  10K+ <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>tracking</span>
                </div>
              </div>
            </div>

            {/* Floating User Pill (Bottom-Left) */}
            <div
              className="glass-float-card"
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
                <Globe size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--forest-950)' }}>
                  10K+
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  Activities Tracked
                </div>
              </div>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'rgba(27, 67, 50, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--forest-800)',
                  cursor: 'pointer',
                }}
                onClick={onStartTracking}
                title="Log an activity now"
              >
                +
              </div>
            </div>

            {/* Subtle Architectural Typography Branding on Diorama */}
            <div
              style={{
                position: 'absolute',
                top: '28px',
                right: '270px',
                textAlign: 'right',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.62rem',
                letterSpacing: '0.12em',
                color: 'rgba(255, 255, 255, 0.85)',
                textShadow: '0 1px 4px rgba(0, 0, 0, 0.3)',
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
        @media (max-width: 640px) {
          .glass-float-card {
            padding: 12px 14px !important;
          }
          .diorama-motto {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
};
