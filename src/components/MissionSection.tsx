import React from 'react';
import { Award, Shield, Compass, Code2 } from 'lucide-react';

export const MissionSection: React.FC = () => {
  const pillars = [
    {
      icon: <Award size={22} />,
      title: 'DEFRA & IPCC AR6 Standards',
      description:
        'All carbon calculations are grounded directly in published emission factors for passenger vehicles, municipal bus networks, regional flights, grid electricity, and dietary choices.',
    },
    {
      icon: <Shield size={22} />,
      title: '100% Local Privacy',
      description:
        'Your daily activities, travel habits, and energy consumption never leave your browser. Zero third-party tracking, zero analytics telemetry, and zero surveillance databases.',
    },
    {
      icon: <Compass size={22} />,
      title: 'Supportive Decision Intelligence',
      description:
        'Rather than punitive guilt, Carbon Pulse delivers explainable pacing telemetry, anomaly detection against accidental inputs, and constructive target adjustment.',
    },
    {
      icon: <Code2 size={22} />,
      title: 'Audit-Ready Transparency',
      description:
        'Formulas are completely transparent and exportable in CSV and JSON formats, enabling reproducible personal audits and seamless data portability.',
    },
  ];

  return (
    <section
      id="mission"
      aria-labelledby="mission-heading"
      style={{
        marginTop: '60px',
        marginBottom: '40px',
        scrollMarginTop: '100px',
      }}
    >
      <div
        className="glass-card"
        style={{
          padding: '40px 36px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        <div style={{ maxWidth: '640px', marginBottom: '32px' }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--forest-700)',
              marginBottom: '8px',
            }}
          >
            OUR MISSION & SCIENTIFIC PRINCIPLES
          </div>
          <h2
            id="mission-heading"
            style={{
              fontSize: 'clamp(1.75rem, 3.2vw, 2.4rem)',
              fontWeight: 800,
              color: 'var(--forest-950)',
              letterSpacing: '-0.025em',
              lineHeight: 1.15,
            }}
          >
            Empowering Personal Climate Accountability
          </h2>
          <p
            style={{
              fontSize: '0.96rem',
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
              marginTop: '12px',
            }}
          >
            Carbon Pulse turns abstract carbon metrics into concrete weekly decisions. By combining
            empirical emission factors with private client-side persistence, we make sustainable living
            transparent, actionable, and dignified.
          </p>
        </div>

        {/* Pillars Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
          }}
        >
          {pillars.map((p) => (
            <div
              key={p.title}
              style={{
                padding: '22px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-surface-soft)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'var(--bg-surface)',
                  color: 'var(--forest-800)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-subtle)',
                }}
              >
                {p.icon}
              </div>
              <div
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: 'var(--forest-950)',
                }}
              >
                {p.title}
              </div>
              <p
                style={{
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.55,
                }}
              >
                {p.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
