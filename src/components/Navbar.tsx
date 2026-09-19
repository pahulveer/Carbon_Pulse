import React from 'react';
import { Leaf, Search, ArrowRight, Target, LayoutDashboard, History } from 'lucide-react';
import type { WeekMetrics } from '../types';

interface NavbarProps {
  metrics: WeekMetrics;
  activeTab: 'dashboard' | 'history';
  onTabChange: (tab: 'dashboard' | 'history') => void;
  onOpenLogModal: () => void;
  onOpenTargetModal: () => void;
  onOpenSolutionsModal: () => void;
  onOpenAboutModal: () => void;
  onOpenSignInModal: () => void;
  onOpenSearchModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  metrics,
  activeTab,
  onTabChange,
  onOpenLogModal,
  onOpenTargetModal,
  onOpenSolutionsModal,
  onOpenAboutModal,
  onOpenSignInModal,
  onOpenSearchModal,
}) => {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(244, 246, 240, 0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(27, 67, 50, 0.08)',
        padding: '14px 24px',
        transition: 'all 0.2s ease',
      }}
    >
      <div
        style={{
          maxWidth: '1360px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        {/* Left: Brand Logo & Title (Matching reference image) */}
        <div
          onClick={() => onTabChange('dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--forest-800)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(27, 67, 50, 0.2)',
            }}
          >
            <Leaf size={18} />
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '1.28rem',
                letterSpacing: '-0.02em',
                color: 'var(--forest-950)',
              }}
            >
              Carbon Pulse
            </span>
          </div>
        </div>

        {/* Center: Navigation Pill (Reference: Home • Track • Insights • Solutions • About) */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.82)',
            border: '1px solid rgba(27, 67, 50, 0.1)',
            borderRadius: 'var(--radius-pill)',
            padding: '4px 8px',
            boxShadow: '0 2px 8px rgba(27, 67, 50, 0.04)',
          }}
          aria-label="Primary Navigation"
          className="navbar-center-pill"
        >
          {/* Home */}
          <button
            onClick={() => onTabChange('dashboard')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.86rem',
              fontWeight: activeTab === 'dashboard' ? 700 : 500,
              color: activeTab === 'dashboard' ? 'var(--forest-950)' : 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              cursor: 'pointer',
            }}
          >
            <span>Home</span>
            {activeTab === 'dashboard' && (
              <span
                style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: 'var(--forest-800)',
                  position: 'absolute',
                  bottom: '2px',
                }}
              />
            )}
          </button>

          {/* Track (Triggers Log Modal) */}
          <button
            onClick={onOpenLogModal}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.86rem',
              fontWeight: 500,
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--forest-950)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            Track
          </button>

          {/* Insights (Scrolls to or focuses on Insights) */}
          <button
            onClick={() => {
              if (activeTab !== 'dashboard') onTabChange('dashboard');
              const el = document.getElementById('insights-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.86rem',
              fontWeight: 500,
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--forest-950)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            Insights
          </button>

          {/* Solutions (Opens Solutions Modal) */}
          <button
            onClick={onOpenSolutionsModal}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.86rem',
              fontWeight: 500,
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--forest-950)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            Solutions
          </button>

          {/* About (Opens About Modal) */}
          <button
            onClick={onOpenAboutModal}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.86rem',
              fontWeight: 500,
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--forest-950)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            About
          </button>

          {/* Activity Ledger Switcher */}
          <button
            onClick={() => onTabChange(activeTab === 'dashboard' ? 'history' : 'dashboard')}
            style={{
              marginLeft: '4px',
              padding: '5px 12px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.78rem',
              fontWeight: 600,
              background: activeTab === 'history' ? 'var(--forest-800)' : 'rgba(27, 67, 50, 0.06)',
              color: activeTab === 'history' ? '#ffffff' : 'var(--forest-800)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            {activeTab === 'history' ? <LayoutDashboard size={13} /> : <History size={13} />}
            <span>{activeTab === 'history' ? 'Dashboard' : 'Ledger'}</span>
          </button>
        </nav>

        {/* Right: Search + Target Pill + Sign In + Get Started */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Target Quick Info Pill */}
          <button
            onClick={onOpenTargetModal}
            className="btn btn-secondary btn-sm"
            title="Configure Weekly Carbon Budget"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              padding: '6px 12px',
              border: metrics.isTargetExceeded ? '1px solid var(--rose-400)' : '1px solid rgba(27, 67, 50, 0.15)',
              background: metrics.isTargetExceeded ? 'rgba(225, 29, 72, 0.08)' : 'rgba(255, 255, 255, 0.9)',
            }}
          >
            <Target size={14} color={metrics.isTargetExceeded ? 'var(--rose-500)' : 'var(--forest-700)'} />
            <span style={{ fontFamily: 'var(--font-mono)' }}>
              Target: <strong>{metrics.targetKg.toFixed(0)} kg</strong>
            </span>
          </button>

          {/* Search Icon */}
          <button
            onClick={onOpenSearchModal}
            className="btn btn-secondary btn-icon"
            style={{ width: '38px', height: '38px', borderRadius: '50%' }}
            aria-label="Search activities and factors"
            title="Search activities (/) "
          >
            <Search size={16} color="var(--forest-900)" />
          </button>

          {/* Sign In button */}
          <button
            onClick={onOpenSignInModal}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.86rem', fontWeight: 600, padding: '7px 16px' }}
          >
            Sign In
          </button>

          {/* Get Started -> button (forest green matching reference) */}
          <button
            onClick={onOpenLogModal}
            className="btn btn-primary btn-sm"
            style={{
              padding: '8px 18px',
              fontSize: '0.86rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>Get Started</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .navbar-center-pill {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};
