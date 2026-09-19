import React from 'react';
import { Lightbulb, Plus, Flame, Calendar, Activity, Compass } from 'lucide-react';
import type { WeekMetrics, ActivityLog } from '../types';
import { computeWeeklyInsights } from '../lib/intelligence';

interface WeeklyInsightsProps {
  metrics: WeekMetrics;
  weeklyActivities: ActivityLog[];
  onOpenLogModal: () => void;
}

const INSIGHT_ICONS = {
  largest_source: <Flame size={18} color="var(--sky-400)" />,
  highest_day: <Calendar size={18} color="var(--amber-400)" />,
  coverage: <Activity size={18} color="var(--emerald-400)" />,
  target_pace: <Compass size={18} color="var(--sky-400)" />,
};

export const WeeklyInsights: React.FC<WeeklyInsightsProps> = ({
  metrics,
  weeklyActivities,
  onOpenLogModal,
}) => {
  const report = computeWeeklyInsights(metrics, weeklyActivities);

  return (
    <section aria-labelledby="weekly-insights-heading">
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Section Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(56, 189, 248, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--sky-400)',
              }}
            >
              <Lightbulb size={18} />
            </div>
            <div>
              <h3 id="weekly-insights-heading" style={{ fontSize: '1.08rem', fontWeight: 700, color: '#FFFFFF' }}>
                Weekly Insights
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Real-time pattern analysis generated from recorded telemetry
              </p>
            </div>
          </div>

          {report.hasData && (
            <span className="badge badge-sky" style={{ fontSize: '0.72rem' }}>
              4 Patterns Identified
            </span>
          )}
        </div>

        {/* Content: Insights Grid vs Empty State */}
        {!report.hasData ? (
          <div
            style={{
              padding: '36px 20px',
              textAlign: 'center',
              background: '#ffffff',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--border-subtle)',
            }}
          >
            <Compass size={32} color="var(--forest-600)" style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--forest-950)', marginBottom: '6px' }}>
              NO INSIGHTS YET
            </h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto 18px auto' }}>
              Add activities to start seeing patterns in your week. As you log commutes, meals, and power usage, this engine interprets your primary drivers.
            </p>
            <button
              onClick={onOpenLogModal}
              className="btn btn-primary btn-sm"
              style={{ margin: '0 auto' }}
            >
              <Plus size={15} />
              <span>Log Activity to Unlock Insights</span>
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '14px',
            }}
          >
            {report.insights.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '16px 18px',
                  borderRadius: 'var(--radius-lg)',
                  background: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '10px',
                  transition: 'border-color var(--transition-fast), transform var(--transition-fast)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {INSIGHT_ICONS[item.type]}
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          letterSpacing: '0.04em',
                          color: 'var(--text-muted)',
                        }}
                      >
                        {item.title}
                      </span>
                    </div>

                    {item.badge && (
                      <span className={`badge badge-${item.badge.variant}`} style={{ fontSize: '0.68rem', padding: '1px 7px' }}>
                        {item.badge.label}
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--forest-950)', lineHeight: 1.3, marginBottom: '6px' }}>
                    {item.headline}
                  </div>

                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    {item.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
