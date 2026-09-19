import React, { useMemo } from 'react';
import { Globe } from 'lucide-react';
import type { ActivityLog, WeekMetrics } from '../../types';

interface HeroTelemetryCardProps {
  metrics: WeekMetrics;
  activities: ActivityLog[];
}

export const HeroTelemetryCard: React.FC<HeroTelemetryCardProps> = ({ metrics, activities }) => {
  // Check if current activities are demo / sample week data
  const isSampleWeek = useMemo(() => {
    return activities.length > 0 && activities.some((a) => a.id.startsWith('sample_'));
  }, [activities]);

  // Compute previous week's total from activities prior to metrics.weekStart
  const trend = useMemo(() => {
    const prevActivities = activities.filter((a) => a.date < metrics.weekStart);
    if (prevActivities.length === 0) {
      return { text: 'Trend unavailable', hasData: false, isDecrease: false };
    }
    const prevTotal = prevActivities.reduce((sum, a) => sum + a.co2Kg, 0);
    if (prevTotal <= 0) {
      return { text: 'Trend unavailable', hasData: false, isDecrease: false };
    }

    const deltaPercent = Math.round(((metrics.totalCo2Kg - prevTotal) / prevTotal) * 100);
    if (deltaPercent < 0) {
      return { text: `▼ ${deltaPercent}%`, hasData: true, isDecrease: true };
    } else if (deltaPercent > 0) {
      return { text: `▲ +${deltaPercent}%`, hasData: true, isDecrease: false };
    }
    return { text: '0% on pace', hasData: true, isDecrease: false };
  }, [activities, metrics.weekStart, metrics.totalCo2Kg]);

  // Daily mini-sparkline heights based on actual dailyTotals
  const maxDay = Math.max(...metrics.dailyTotals.map((d) => d.totalCo2), 1);
  const sparklineDays = metrics.dailyTotals.map((d) => ({
    label: d.dayName,
    height: d.totalCo2 > 0 ? Math.max(16, Math.min(100, Math.round((d.totalCo2 / maxDay) * 100))) : 8,
    active: d.totalCo2 > 0,
    co2: d.totalCo2,
  }));

  return (
    <div
      className="glass-float-card hero-telemetry-card"
      style={{
        position: 'absolute',
        top: '28px',
        left: '24px',
        width: '264px',
        zIndex: 2,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              background: 'rgba(36, 90, 66, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--forest-800)',
            }}
          >
            <Globe size={13} />
          </div>
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
            }}
          >
            Weekly Footprint
          </span>
        </div>

        {isSampleWeek && (
          <span
            className="badge badge-amber"
            style={{ fontSize: '0.62rem', padding: '1px 6px', letterSpacing: '0.04em' }}
            title="Showing generated demo data"
          >
            SAMPLE WEEK
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
        <span
          className="telemetry-val"
          style={{
            fontSize: '2rem',
            fontWeight: 800,
            fontFamily: 'var(--font-display)',
            color: 'var(--forest-950)',
            lineHeight: 1,
          }}
        >
          {metrics.totalCo2Kg.toFixed(1)}
        </span>
        <span
          style={{
            fontSize: '0.92rem',
            fontWeight: 700,
            color: 'var(--forest-700)',
          }}
        >
          kg CO₂
        </span>
      </div>

      {/* Real Trend Indicator Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <span
          className={`badge ${
            !trend.hasData
              ? 'badge-sky'
              : trend.isDecrease
              ? 'badge-emerald'
              : 'badge-rose'
          }`}
          style={{
            fontSize: '0.68rem',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
          }}
        >
          {trend.text}
        </span>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          {trend.hasData ? 'vs previous log' : 'cycle baseline'}
        </span>
      </div>

      {/* 7-Day Sparkline Bar Chart */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '4px',
          height: '38px',
          paddingTop: '6px',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        {sparklineDays.map((d, i) => (
          <div
            key={i}
            title={`${d.label}: ${d.co2.toFixed(1)} kg CO₂`}
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
                background: d.active ? 'var(--forest-800)' : 'var(--sage-200)',
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
  );
};
