import React from 'react';
import { Leaf, Heart, Globe, ArrowUp } from 'lucide-react';

interface FooterProps {
  onNavClick: (section: 'home' | 'track' | 'insights' | 'solutions' | 'about' | 'history') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavClick }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(255, 255, 255, 0.65)',
        backdropFilter: 'blur(16px)',
        padding: '50px 24px 30px 24px',
        marginTop: '60px',
      }}
    >
      <div
        style={{
          maxWidth: '1360px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '36px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '32px',
          }}
        >
          {/* Brand & Mission */}
          <div style={{ maxWidth: '420px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
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
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: '1.25rem',
                  letterSpacing: '-0.02em',
                  color: 'var(--forest-950)',
                }}
              >
                Carbon Pulse
              </span>
              <span className="badge badge-emerald" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                v2.0 Nature Edition
              </span>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              A high-precision climate analytics command center turning everyday activities into
              transparent weekly intelligence. Built with Apple-level design restraint and nature-inspired aesthetics.
            </p>
          </div>

          {/* Navigation Links Column */}
          <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--forest-900)', marginBottom: '12px', letterSpacing: '0.06em' }}>
                Navigation
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.86rem' }}>
                <li>
                  <button onClick={() => onNavClick('home')} style={{ color: 'var(--text-muted)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--forest-800)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}>
                    Home Overview
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavClick('track')} style={{ color: 'var(--text-muted)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--forest-800)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}>
                    Activity Tracker
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavClick('insights')} style={{ color: 'var(--text-muted)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--forest-800)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}>
                    Weekly Insights
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavClick('solutions')} style={{ color: 'var(--text-muted)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--forest-800)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}>
                    Climate Solutions
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavClick('history')} style={{ color: 'var(--text-muted)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--forest-800)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}>
                    Full Activity Ledger
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--forest-900)', marginBottom: '12px', letterSpacing: '0.06em' }}>
                Scientific Standards
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                <li>IPCC AR6 Greenhouse Gas Matrix</li>
                <li>UK DEFRA 2024 Factors</li>
                <li>Zero-Cloud Local Encryption</li>
                <li>Deterministic Pace Telemetry</li>
              </ul>
            </div>
          </div>

          {/* Back to top & Sustainability badge */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
            <button
              onClick={scrollToTop}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <span>Back to top</span>
              <ArrowUp size={14} />
            </button>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(45, 106, 79, 0.08)',
                border: '1px solid rgba(45, 106, 79, 0.2)',
                fontSize: '0.74rem',
                color: 'var(--forest-900)',
              }}
            >
              <Globe size={14} color="var(--forest-700)" />
              <span>Carbon-Neutral Static Hosting • GitHub Pages</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
          }}
        >
          <div>
            © {new Date().getFullYear()} Carbon Pulse. Designed for Hackathon Round 2 with{' '}
            <Heart size={12} color="var(--forest-600)" style={{ display: 'inline', verticalAlign: 'middle' }} /> for the planet.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span>Private & Client-Side Local Store</span>
            <span>•</span>
            <span>No Cookies / No Third-Party Tracking</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
