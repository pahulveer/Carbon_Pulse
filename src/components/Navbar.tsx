import React, { useState } from 'react';
import { Leaf, Search, ArrowRight, Target, LayoutDashboard, History, Menu, X, Sparkles } from 'lucide-react';
import type { WeekMetrics } from '../types';

interface NavbarProps {
  metrics: WeekMetrics;
  activeTab: 'dashboard' | 'history';
  onTabChange: (tab: 'dashboard' | 'history') => void;
  onOpenLogModal: () => void;
  onOpenTargetModal: () => void;
  onOpenSolutionsDrawer: () => void;
  onOpenSearchModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  metrics,
  activeTab,
  onTabChange,
  onOpenLogModal,
  onOpenTargetModal,
  onOpenSolutionsDrawer,
  onOpenSearchModal,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    if (activeTab !== 'dashboard') {
      onTabChange('dashboard');
    }
    // Allow state to settle before scrolling
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(244, 246, 240, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '12px 24px',
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
        {/* Left: Brand Logo & Title */}
        <div
          onClick={() => scrollToSection('home')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              scrollToSection('home');
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            userSelect: 'none',
          }}
          aria-label="Carbon Pulse Home"
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

        {/* Center: Desktop Navigation Pill */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.85)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-pill)',
            padding: '4px 8px',
            boxShadow: 'var(--shadow-subtle)',
          }}
          aria-label="Primary Navigation"
          className="navbar-desktop-nav"
        >
          {/* Home */}
          <button
            type="button"
            onClick={() => scrollToSection('home')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.86rem',
              fontWeight: 600,
              color: 'var(--forest-950)',
              cursor: 'pointer',
            }}
          >
            Home
          </button>

          {/* Track (Scrolls to #track) */}
          <button
            type="button"
            onClick={() => scrollToSection('track')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.86rem',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--forest-950)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            Track
          </button>

          {/* Insights (Scrolls to #insights-section) */}
          <button
            type="button"
            onClick={() => scrollToSection('insights-section')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.86rem',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--forest-950)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            Insights
          </button>

          {/* Solutions (Opens Solutions Drawer) */}
          <button
            type="button"
            onClick={onOpenSolutionsDrawer}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.86rem',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--forest-950)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            <Sparkles size={14} color="var(--forest-600)" />
            <span>Solutions</span>
          </button>

          {/* About / Mission (Scrolls to #mission) */}
          <button
            type="button"
            onClick={() => scrollToSection('mission')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.86rem',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--forest-950)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            About
          </button>

          {/* Activity Ledger Switcher */}
          <button
            type="button"
            onClick={() => onTabChange(activeTab === 'dashboard' ? 'history' : 'dashboard')}
            style={{
              marginLeft: '6px',
              padding: '5px 12px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.78rem',
              fontWeight: 700,
              background: activeTab === 'history' ? 'var(--forest-800)' : 'rgba(27, 67, 50, 0.08)',
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

        {/* Right: Search + Target Pill + Get Started + Mobile Hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Target Quick Info Pill */}
          <button
            type="button"
            onClick={onOpenTargetModal}
            className="btn btn-secondary btn-sm"
            title="Configure Weekly Carbon Budget"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              padding: '6px 12px',
              border: metrics.isTargetExceeded ? '1px solid var(--rose-400)' : '1px solid var(--border-subtle)',
              background: metrics.isTargetExceeded ? 'rgba(225, 29, 72, 0.08)' : 'rgba(255, 255, 255, 0.9)',
            }}
          >
            <Target size={14} color={metrics.isTargetExceeded ? 'var(--rose-500)' : 'var(--forest-700)'} />
            <span style={{ fontFamily: 'var(--font-mono)' }} className="navbar-target-text">
              Target: <strong>{metrics.targetKg.toFixed(0)} kg</strong>
            </span>
          </button>

          {/* Search Icon */}
          <button
            type="button"
            onClick={onOpenSearchModal}
            className="btn btn-secondary btn-icon"
            style={{ width: '38px', height: '38px', borderRadius: '50%' }}
            aria-label="Search activities and emission factors"
            title="Search activities (/) "
          >
            <Search size={16} color="var(--forest-900)" />
          </button>

          {/* Primary CTA: Log Activity / Get Started */}
          <button
            type="button"
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
            <span>Log Activity</span>
            <ArrowRight size={15} />
          </button>

          {/* Accessible Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="btn btn-secondary btn-icon navbar-mobile-toggle"
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Accessible Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div
          role="region"
          aria-label="Mobile Navigation Menu"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-floating)',
            padding: '16px 20px 24px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            zIndex: 99,
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <button
            type="button"
            onClick={() => scrollToSection('home')}
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start', padding: '12px 16px' }}
          >
            Home
          </button>

          <button
            type="button"
            onClick={() => scrollToSection('track')}
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start', padding: '12px 16px' }}
          >
            Track Activities
          </button>

          <button
            type="button"
            onClick={() => scrollToSection('insights-section')}
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start', padding: '12px 16px' }}
          >
            Weekly Insights
          </button>

          <button
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(false);
              onOpenSolutionsDrawer();
            }}
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start', padding: '12px 16px', color: 'var(--forest-800)', fontWeight: 700 }}
          >
            <Sparkles size={16} />
            <span>Climate Solutions</span>
          </button>

          <button
            type="button"
            onClick={() => scrollToSection('mission')}
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start', padding: '12px 16px' }}
          >
            Mission & Principles
          </button>

          <button
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(false);
              onTabChange(activeTab === 'dashboard' ? 'history' : 'dashboard');
            }}
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start', padding: '12px 16px' }}
          >
            {activeTab === 'history' ? <LayoutDashboard size={16} /> : <History size={16} />}
            <span>Switch to {activeTab === 'history' ? 'Dashboard' : 'Ledger'}</span>
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .navbar-desktop-nav {
            display: none !important;
          }
          .navbar-mobile-toggle {
            display: inline-flex !important;
          }
          .navbar-target-text {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};
