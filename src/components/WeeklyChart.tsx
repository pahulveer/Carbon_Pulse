import React, { useState } from 'react';
import type { WeekMetrics } from '../types';

interface WeeklyChartProps {
  metrics: WeekMetrics;
  onSelectDay?: (dayDate: string) => void;
}

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ metrics, onSelectDay }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const dailyTotals = metrics.dailyTotals;
  const maxDayVal = Math.max(...dailyTotals.map((d) => d.totalCo2), 0.5);
  const dailyTargetRef = metrics.targetKg / 7;
  // Scale dynamically to accommodate both max daily value and target benchmark line
  const chartMax = Math.max(maxDayVal, dailyTargetRef) * 1.25;

  // Chart dimensions
  const height = 180;
  const barWidth = 32;
  const gap = 24;
  const totalWidth = dailyTotals.length * (barWidth + gap);

  return (
    <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Weekly Daily Emissions</h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Monday through Sunday distribution ({metrics.weekRangeFormatted})
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--emerald-500)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Daily Total</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '2px', background: 'rgba(255, 255, 255, 0.4)', borderTop: '1px dashed #FFFFFF' }} />
            <span style={{ color: 'var(--text-muted)' }}>Daily Avg Target ({(metrics.targetKg / 7).toFixed(1)} kg)</span>
          </div>
        </div>
      </div>

      {/* Interactive SVG Bar Chart */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          minHeight: '200px',
          position: 'relative',
        }}
      >
        {/* Dynamic Tooltip display anchored to hovered bar */}
        {hoveredIdx !== null && (
          <div
            style={{
              position: 'absolute',
              top: '-6px',
              left: `${Math.min(Math.max(((10 + hoveredIdx * (barWidth + gap) + barWidth / 2) / (totalWidth + 20)) * 100, 16), 84)}%`,
              transform: 'translateX(-50%)',
              background: 'rgba(10, 18, 32, 0.96)',
              border: '1px solid var(--emerald-400)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 12px',
              fontSize: '0.8rem',
              fontFamily: 'var(--font-mono)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.55)',
              zIndex: 10,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              transition: 'left 0.15s ease-out',
            }}
          >
            <strong>{dailyTotals[hoveredIdx].dayName} ({dailyTotals[hoveredIdx].dayDate})</strong>: {dailyTotals[hoveredIdx].totalCo2.toFixed(2)} kg CO₂ ({dailyTotals[hoveredIdx].activityCount} activities)
          </div>
        )}

        <svg
          viewBox={`0 0 ${totalWidth + 20} ${height + 30}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
          role="img"
          aria-label="Weekly Daily Emissions Bar Chart"
        >
          {/* Reference Target Guideline */}
          {dailyTargetRef > 0 && (
            <line
              x1="0"
              y1={height - (dailyTargetRef / chartMax) * height}
              x2={totalWidth + 20}
              y2={height - (dailyTargetRef / chartMax) * height}
              stroke="rgba(255, 255, 255, 0.25)"
              strokeDasharray="4 4"
              strokeWidth="1.5"
            />
          )}

          {dailyTotals.map((d, i) => {
            const barHeight = d.totalCo2 > 0 ? (d.totalCo2 / chartMax) * height : 4;
            const x = 10 + i * (barWidth + gap);
            const y = height - barHeight;
            const isHovered = hoveredIdx === i;

            return (
              <g
                key={d.dayDate}
                tabIndex={0}
                role="button"
                aria-label={`${d.dayName} ${d.dayDate}: ${d.totalCo2.toFixed(2)} kg CO2 across ${d.activityCount} activities. Click to view history.`}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                onFocus={() => setHoveredIdx(i)}
                onBlur={() => setHoveredIdx(null)}
                onClick={() => onSelectDay && onSelectDay(d.dayDate)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (onSelectDay) onSelectDay(d.dayDate);
                  }
                }}
                style={{ cursor: 'pointer', outline: 'none' }}
              >
                {/* Background column hover highlight */}
                <rect
                  x={x - gap / 4}
                  y="0"
                  width={barWidth + gap / 2}
                  height={height + 25}
                  fill={isHovered ? 'rgba(255, 255, 255, 0.05)' : 'transparent'}
                  rx="6"
                  stroke={isHovered ? 'rgba(52, 211, 153, 0.3)' : 'none'}
                  strokeWidth="1"
                />

                {/* The Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="6"
                  fill={
                    d.isToday
                      ? 'url(#today-bar-gradient)'
                      : d.totalCo2 > dailyTargetRef
                      ? 'url(#elevated-bar-gradient)'
                      : 'url(#normal-bar-gradient)'
                  }
                  stroke={d.isToday ? 'var(--emerald-400)' : isHovered ? '#FFFFFF' : 'none'}
                  strokeWidth={d.isToday || isHovered ? 1.5 : 0}
                  style={{
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    transformOrigin: 'bottom',
                  }}
                />

                {/* Value on top of bar if space allows */}
                {d.totalCo2 > 0 && (
                  <text
                    x={x + barWidth / 2}
                    y={Math.max(y - 6, 14)}
                    textAnchor="middle"
                    fill={d.isToday ? 'var(--emerald-400)' : 'var(--text-secondary)'}
                    fontSize="10"
                    fontFamily="var(--font-mono)"
                    fontWeight="600"
                  >
                    {d.totalCo2 >= 10 ? d.totalCo2.toFixed(1) : d.totalCo2.toFixed(1)}
                  </text>
                )}

                {/* Day Label Below */}
                <text
                  x={x + barWidth / 2}
                  y={height + 18}
                  textAnchor="middle"
                  fill={d.isToday ? 'var(--emerald-400)' : 'var(--text-muted)'}
                  fontSize="12"
                  fontFamily="var(--font-display)"
                  fontWeight={d.isToday ? '700' : '500'}
                >
                  {d.dayName}
                </text>

                {/* Today indicator dot */}
                {d.isToday && (
                  <circle cx={x + barWidth / 2} cy={height + 26} r="2.5" fill="var(--emerald-400)" />
                )}
              </g>
            );
          })}

          {/* SVG Gradients */}
          <defs>
            <linearGradient id="normal-bar-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0.6" />
            </linearGradient>

            <linearGradient id="today-bar-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34D399" stopOpacity="1" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.75" />
            </linearGradient>

            <linearGradient id="elevated-bar-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#B45309" stopOpacity="0.7" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Week Summary Micro-strip */}
      <div
        style={{
          marginTop: '16px',
          paddingTop: '12px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        <span>Monday Start: {metrics.weekStart}</span>
        <span>Sunday End: {metrics.weekEnd}</span>
      </div>
    </div>
  );
};
