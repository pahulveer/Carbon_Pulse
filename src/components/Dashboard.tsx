import React, { useState } from 'react';
import {
  Target,
  Plus,
  ArrowUpRight,
  Sparkles,
  Car,
  Bus,
  Plane,
  Zap,
  Salad,
  Beef,
  Trash2,
  Edit2,
} from 'lucide-react';
import type { ActivityCategory, ActivityLog, ActivityType, WeekMetrics } from '../types';
import { WeeklyChart } from './WeeklyChart';
import { CategoryBreakdown } from './CategoryBreakdown';
import { WeeklyInsights } from './WeeklyInsights';
import { TrackingHealth } from './TrackingHealth';
import { CategoryDetailDrawer } from './CategoryDetailDrawer';
import { formatDateDisplay } from '../lib/weekUtils';
import { ACTIVITY_DEFINITIONS } from '../lib/emissions';

interface DashboardProps {
  metrics: WeekMetrics;
  recentActivities: ActivityLog[];
  onOpenLogModal: (initialType?: ActivityType) => void;
  onOpenTargetModal: () => void;
  onDeleteActivity: (id: string) => void;
  onEditActivity?: (activity: ActivityLog) => void;
  onViewAllHistory: () => void;
  onFilterByCategory?: (cat: ActivityCategory) => void;
}

const ICONS_MAP: Record<ActivityType, React.ReactNode> = {
  car: <Car size={16} />,
  bus: <Bus size={16} />,
  flight: <Plane size={16} />,
  electricity: <Zap size={16} />,
  veg_meal: <Salad size={16} />,
  non_veg_meal: <Beef size={16} />,
};

export const Dashboard: React.FC<DashboardProps> = ({
  metrics,
  recentActivities,
  onOpenLogModal,
  onOpenTargetModal,
  onDeleteActivity,
  onEditActivity,
  onViewAllHistory,
  onFilterByCategory,
}) => {
  const [drawerCategory, setDrawerCategory] = useState<ActivityCategory | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleOpenDrawer = (cat: ActivityCategory) => {
    setDrawerCategory(cat);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setDrawerCategory(null);
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Hero KPI Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Card 1: Total Weekly Footprint */}
        <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
          {/* Subtle ambient corner illumination (smooth elliptical falloff, no hard circular artifact) */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '200px',
              height: '140px',
              background: 'radial-gradient(ellipse 160px 100px at 100% 0%, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.02) 50%, transparent 80%)',
              pointerEvents: 'none',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Weekly Emissions
            </span>
            <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
              {metrics.weekRangeFormatted}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
            <span className="metric-hero telemetry-val">
              {metrics.totalCo2Kg.toFixed(1)}
            </span>
            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--emerald-400)' }}>
              kg CO₂
            </span>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Total carbon output logged for the current Monday → Sunday cycle.
          </p>
        </div>

        {/* Card 2: Weekly Budget & Target */}
        <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Carbon Target
            </span>
            <button
              onClick={onOpenTargetModal}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.72rem', padding: '2px 8px' }}
            >
              <Target size={12} />
              <span>Edit Goal</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
            <span className="metric-hero telemetry-val" style={{ color: metrics.isTargetExceeded ? 'var(--rose-400)' : 'var(--text-primary)' }}>
              {metrics.percentUsed}%
            </span>
            <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
              of {metrics.targetKg.toFixed(1)} kg used
            </span>
          </div>

          {/* Target Progress Bar */}
          <div
            style={{
              width: '100%',
              height: '8px',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: `${Math.min(metrics.percentUsed, 100)}%`,
                height: '100%',
                background: metrics.isTargetExceeded
                  ? 'linear-gradient(90deg, #FB7185 0%, #F43F5E 100%)'
                  : 'linear-gradient(90deg, #34D399 0%, #10B981 100%)',
                borderRadius: 'var(--radius-full)',
                transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          </div>
        </div>

        {/* Card 3: Remaining Budget or Excess Delta */}
        <div
          className="glass-card"
          style={{
            border: metrics.isTargetExceeded ? '1.5px solid rgba(244, 63, 94, 0.5)' : undefined,
            boxShadow: metrics.isTargetExceeded ? '0 4px 20px rgba(244, 63, 94, 0.15)' : undefined,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              {metrics.isTargetExceeded ? 'Carbon Overdraft Deficit' : 'Remaining Budget'}
            </span>
            <span
              className={`badge ${metrics.isTargetExceeded ? 'badge-rose' : 'badge-emerald'}`}
              style={{ fontSize: '0.7rem', fontWeight: metrics.isTargetExceeded ? 700 : 600 }}
            >
              {metrics.isTargetExceeded ? 'DEFICIT ACCUMULATING' : 'Safe Window'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
            <span
              className="metric-hero telemetry-val"
              style={{ color: metrics.isTargetExceeded ? 'var(--rose-400)' : 'var(--emerald-400)' }}
            >
              {metrics.isTargetExceeded ? `+${metrics.excessKg.toFixed(1)}` : metrics.remainingKg.toFixed(1)}
            </span>
            <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              kg CO₂
            </span>
          </div>

          <p style={{ fontSize: '0.82rem', color: metrics.isTargetExceeded ? 'var(--rose-400)' : 'var(--text-secondary)' }}>
            {metrics.isTargetExceeded
              ? `${metrics.excessKg.toFixed(1)} kg over weekly limit. Operating in active climate deficit.`
              : `${metrics.remainingKg.toFixed(1)} kg allowance remaining until Sunday 23:59.`}
          </p>
        </div>

        {/* Card 4: Decision Point 3 Pacing Telemetry */}
        <div className="glass-card" style={{ borderLeft: '4px solid var(--sky-400)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Pace Telemetry (DP3)
            </span>
            <span
              className={`badge ${
                metrics.paceStatus === 'ON PACE'
                  ? 'badge-emerald'
                  : metrics.paceStatus === 'ABOVE CURRENT PACE'
                  ? 'badge-amber'
                  : 'badge-sky'
              }`}
            >
              {metrics.paceStatus}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target Used:</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                {metrics.percentUsed}%
              </div>
            </div>

            <div style={{ width: '1px', height: '36px', background: 'var(--border-subtle)' }} />

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Week Elapsed:</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--sky-400)' }}>
                {metrics.percentElapsed}%
              </div>
            </div>
          </div>

          <div style={{ marginTop: '12px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Comparing consumption pace against calendar time.
          </div>
        </div>
      </div>

      {/* 2. Visualizations Grid (7-Day Bar Chart + Category Donut) */}
      <div
        id="insights-section"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '20px',
          scrollMarginTop: '90px',
        }}
      >
        <WeeklyChart metrics={metrics} />
        <CategoryBreakdown
          metrics={metrics}
          onFilterByCategory={onFilterByCategory}
          onSelectCategory={handleOpenDrawer}
        />
      </div>

      {/* 3. Product Intelligence Section: Weekly Insights (Feature 1) + Tracking Health (Feature 3) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '20px',
          alignItems: 'stretch',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <WeeklyInsights
            metrics={metrics}
            weeklyActivities={recentActivities}
            onOpenLogModal={() => onOpenLogModal()}
          />
        </div>
        <div style={{ minWidth: 0 }}>
          <TrackingHealth
            metrics={metrics}
            weeklyActivities={recentActivities}
            onOpenLogModal={() => onOpenLogModal()}
          />
        </div>
      </div>

      {/* 4. Quick Logger Bar & Recent Activities */}
      <div className="glass-card">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Recent Activities</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Real-time feed of recorded emissions
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => onOpenLogModal()}
              className="btn btn-primary btn-sm"
            >
              <Plus size={15} />
              <span>Log Activity</span>
            </button>
            <button
              onClick={onViewAllHistory}
              className="btn btn-secondary btn-sm"
            >
              <span>View All History</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

        {recentActivities.length === 0 ? (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              background: '#ffffff',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--border-subtle)',
            }}
          >
            <Sparkles size={32} color="var(--forest-600)" style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--forest-950)', marginBottom: '4px' }}>
              No activities logged this week yet
            </h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Start tracking your daily commutes, power consumption, or meals to visualize your pulse.
            </p>
            <button onClick={() => onOpenLogModal()} className="btn btn-primary btn-sm">
              <Plus size={15} />
              <span>Log Your First Activity</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentActivities.slice(0, 5).map((act) => {
              const def = ACTIVITY_DEFINITIONS[act.type] || ACTIVITY_DEFINITIONS.car;
              return (
                <div
                  key={act.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: '#ffffff',
                    border: '1px solid var(--border-subtle)',
                    boxShadow: 'var(--shadow-subtle)',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: 'rgba(27, 67, 50, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--forest-800)',
                      }}
                    >
                      {ICONS_MAP[act.type]}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--forest-950)', fontSize: '0.92rem' }}>
                          {def.label}
                        </span>
                        {act.flaggedAsAbsurd && (
                          <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>
                            Flagged Anomaly
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        {act.quantity} {act.unit} {act.notes ? `• ${act.notes}` : ''}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: 'var(--emerald-400)' }}>
                        {act.co2Kg.toFixed(2)} kg
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                        {formatDateDisplay(act.date)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {onEditActivity && (
                        <button
                          onClick={() => onEditActivity(act)}
                          title="Edit activity"
                          aria-label={`Edit ${def.label} from ${act.date}`}
                          className="btn btn-secondary btn-icon"
                          style={{
                            display: 'inline-flex',
                            color: 'var(--text-dim)',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--sky-400)')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
                        >
                          <Edit2 size={14} />
                        </button>
                      )}

                      <button
                        onClick={() => onDeleteActivity(act.id)}
                        title="Delete activity"
                        aria-label={`Delete ${def.label} from ${act.date}`}
                        className="btn btn-secondary btn-icon"
                        style={{
                          display: 'inline-flex',
                          color: 'var(--text-dim)',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--rose-400)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Feature 2: Slide-Over Activity Detail Drawer */}
      <CategoryDetailDrawer
        isOpen={isDrawerOpen}
        category={drawerCategory}
        allActivities={recentActivities}
        metrics={metrics}
        onClose={handleCloseDrawer}
        onOpenLogModal={(initialType) => {
          handleCloseDrawer();
          onOpenLogModal(initialType);
        }}
        onViewInHistory={(cat) => {
          handleCloseDrawer();
          if (onFilterByCategory) {
            onFilterByCategory(cat);
          } else {
            onViewAllHistory();
          }
        }}
        onEditActivity={(act) => {
          handleCloseDrawer();
          onEditActivity?.(act);
        }}
        onDeleteActivity={onDeleteActivity}
      />
    </div>
  );
};
