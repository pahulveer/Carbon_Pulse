import React from 'react';
import { ShieldCheck, Info, CheckCircle2, Circle } from 'lucide-react';
import type { WeekMetrics, ActivityLog } from '../types';
import { computeTrackingHealth } from '../lib/intelligence';

interface TrackingHealthProps {
  metrics: WeekMetrics;
  weeklyActivities: ActivityLog[];
  onOpenLogModal?: () => void;
}

export const TrackingHealth: React.FC<TrackingHealthProps> = ({
  metrics,
  weeklyActivities,
  onOpenLogModal,
}) => {
  const health = computeTrackingHealth(metrics, weeklyActivities);

  const tierBadgeMap = {
    GOOD: 'badge-emerald',
    PARTIAL: 'badge-amber',
    'NOT STARTED': 'badge-sky',
  };

  return (
    <div
      className="glass-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} color="var(--emerald-400)" />
          <div>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Tracking Health
            </span>
            <div style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--forest-950)' }}>
              Dataset Completeness
            </div>
          </div>
        </div>

        <span className={`badge ${tierBadgeMap[health.tier]}`} style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}>
          {health.tier}
        </span>
      </div>

      {/* Main Metric & Score */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '1.28rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--forest-950)' }}>
            {health.scoreLabel}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {health.totalActivitiesCount} activities logged across {health.categoriesTrackedCount} / {health.totalCategories} categories
          </div>
        </div>
      </div>

      {/* 7-Day Visual Activity Map (Mon -> Sun) */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '6px',
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            fontWeight: 600,
            textTransform: 'uppercase',
          }}
        >
          <span>7-Day Log Continuity</span>
          <span>{health.daysCoveredCount}/7 Days</span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '6px',
          }}
        >
          {health.days.map((d) => (
            <div
              key={d.dayDate}
              title={`${d.dayName}: ${d.hasActivity ? `${d.activityCount} logged (${d.totalCo2.toFixed(1)} kg)` : 'No entries logged'}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 2px',
                borderRadius: '6px',
                background: d.isToday
                  ? 'rgba(45, 106, 79, 0.12)'
                  : d.hasActivity
                  ? 'rgba(45, 106, 79, 0.06)'
                  : 'rgba(27, 67, 50, 0.02)',
                border: d.isToday
                  ? '1.5px solid var(--forest-800)'
                  : d.hasActivity
                  ? '1px solid rgba(45, 106, 79, 0.25)'
                  : '1px solid var(--border-subtle)',
              }}
            >
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: d.isToday ? 'var(--forest-800)' : d.hasActivity ? 'var(--forest-950)' : 'var(--text-dim)',
                }}
              >
                {d.dayName.slice(0, 2)}
              </span>

              {d.hasActivity ? (
                <CheckCircle2 size={12} color="var(--forest-700)" />
              ) : (
                <Circle size={12} color="var(--text-dim)" strokeWidth={1.5} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Explanatory Narrative: Distinguishing 0 Logged from 0 Emissions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          padding: '8px 10px',
          borderRadius: '6px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderLeft: '3px solid var(--sky-400)',
        }}
      >
        <Info size={14} color="var(--sky-400)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
          {health.explanatoryNarrative}
        </p>
      </div>

      {health.tier === 'NOT STARTED' && onOpenLogModal && (
        <button
          onClick={onOpenLogModal}
          className="btn btn-primary btn-sm"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <span>LOG ACTIVITY</span>
        </button>
      )}
    </div>
  );
};
