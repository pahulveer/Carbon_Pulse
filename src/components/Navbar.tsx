import React from 'react';
import { Activity, Plus, Target, Calendar, History, LayoutDashboard } from 'lucide-react';
import type { WeekMetrics } from '../types';

interface NavbarProps {
  metrics: WeekMetrics;
  activeTab: 'dashboard' | 'history';
  onTabChange: (tab: 'dashboard' | 'history') => void;
  onOpenLogModal: () => void;
  onOpenTargetModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  metrics,
  activeTab,
  onTabChange,
  onOpenLogModal,
  onOpenTargetModal,
}) => {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(7, 11, 18, 0.88)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '14px 24px',
      }}
    >
      <div
        style={{
          maxWidth: '1320px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(56, 189, 248, 0.1) 100%)',
              border: '1px solid rgba(52, 211, 153, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(16, 185, 129, 0.2)',
            }}
          >
            <Activity size={22} color="var(--emerald-400)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: '1.25rem',
                  letterSpacing: '0.04em',
                  background: 'linear-gradient(90deg, #FFFFFF 0%, #34D399 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                CARBON//PULSE
              </span>
              <span className="badge badge-emerald" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                v1.0 Live
              </span>
            </div>
            <div
              style={{
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <Calendar size={12} />
              <span>{metrics.weekRangeFormatted}</span>
              <span style={{ color: 'var(--text-dim)' }}>•</span>
              <span className="pulse-dot" style={{ width: '6px', height: '6px' }}></span>
              <span style={{ color: 'var(--emerald-400)' }}>Active Week</span>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(14, 22, 38, 0.8)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            padding: '4px',
          }}
          aria-label="Main Navigation"
        >
          <button
            onClick={() => onTabChange('dashboard')}
            className="btn btn-sm"
            style={{
              borderRadius: 'var(--radius-full)',
              background: activeTab === 'dashboard' ? 'rgba(52, 211, 153, 0.18)' : 'transparent',
              color: activeTab === 'dashboard' ? 'var(--emerald-400)' : 'var(--text-secondary)',
              border: activeTab === 'dashboard' ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid transparent',
              fontWeight: 600,
            }}
          >
            <LayoutDashboard size={15} />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => onTabChange('history')}
            className="btn btn-sm"
            style={{
              borderRadius: 'var(--radius-full)',
              background: activeTab === 'history' ? 'rgba(56, 189, 248, 0.18)' : 'transparent',
              color: activeTab === 'history' ? 'var(--sky-400)' : 'var(--text-secondary)',
              border: activeTab === 'history' ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
              fontWeight: 600,
            }}
          >
            <History size={15} />
            <span>Activity Ledger</span>
          </button>
        </nav>

        {/* Action Controls & Target Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Target Quick Button */}
          <button
            onClick={onOpenTargetModal}
            className="btn btn-secondary btn-sm"
            title="Configure Weekly Carbon Budget"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderColor: metrics.isTargetExceeded ? 'rgba(244, 63, 94, 0.4)' : 'var(--border-subtle)',
              background: metrics.isTargetExceeded ? 'rgba(244, 63, 94, 0.08)' : 'rgba(255, 255, 255, 0.04)',
            }}
          >
            <Target size={15} color={metrics.isTargetExceeded ? 'var(--rose-400)' : 'var(--emerald-400)'} />
            <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>
              Target:{' '}
              <strong style={{ color: metrics.isTargetExceeded ? 'var(--rose-400)' : 'var(--text-primary)' }}>
                {metrics.targetKg.toFixed(1)} kg
              </strong>
            </span>
          </button>

          {/* Primary CTA */}
          <button
            onClick={onOpenLogModal}
            className="btn btn-primary"
            style={{
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.35)',
              fontWeight: 700,
            }}
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>LOG ACTIVITY</span>
          </button>
        </div>
      </div>
    </header>
  );
};
