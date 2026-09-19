import React from 'react';
import type { WeekMetrics } from '../../types';

interface HeroBreakdownCardProps {
  metrics: WeekMetrics;
}

export const HeroBreakdownCard: React.FC<HeroBreakdownCardProps> = ({ metrics }) => {
  const categories = metrics.categoryTotals;
  const total = metrics.totalCo2Kg;

  // Donut geometry constants
  const size = 68;
  const radius = 22;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div
      className="glass-float-card hero-breakdown-card"
      style={{
        position: 'absolute',
        top: '28px',
        right: '24px',
        width: '236px',
        zIndex: 2,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--forest-950)' }}>
          Breakdown
        </span>
        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {total > 0 ? `${total.toFixed(1)} kg` : '0 kg'}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Real SVG Donut */}
        <div style={{ position: 'relative', width: `${size}px`, height: `${size}px`, flexShrink: 0 }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Hero category breakdown donut">
            {/* Background Empty Ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="var(--sage-200)"
              strokeWidth="7"
            />

            {total > 0 &&
              categories.map((c) => {
                if (c.totalCo2 <= 0) return null;
                const ratio = c.totalCo2 / total;
                const strokeDasharray = `${ratio * circumference} ${circumference}`;
                const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
                accumulatedPercent += ratio * 100;

                return (
                  <circle
                    key={c.category}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke={c.color}
                    strokeWidth="7"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                  />
                );
              })}
          </svg>
        </div>

        {/* Legend List from Real Category Totals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
          {total === 0 ? (
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Awaiting activity logs
            </span>
          ) : (
            categories.map((item) => (
              <div
                key={item.category}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.72rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: item.color,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                </div>
                <span style={{ fontWeight: 700, color: 'var(--forest-950)', fontFamily: 'var(--font-mono)' }}>
                  {item.percentage}%
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
