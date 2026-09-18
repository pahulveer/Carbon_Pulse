import React, { useState } from 'react';
import { Car, Zap, Salad, PieChart } from 'lucide-react';
import type { ActivityCategory, WeekMetrics } from '../types';

interface CategoryBreakdownProps {
  metrics: WeekMetrics;
  onFilterByCategory?: (cat: ActivityCategory) => void;
  onSelectCategory?: (cat: ActivityCategory) => void;
}

const CATEGORY_ICONS: Record<ActivityCategory, React.ReactNode> = {
  transport: <Car size={18} />,
  energy: <Zap size={18} />,
  food: <Salad size={18} />,
};

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({
  metrics,
  onFilterByCategory,
  onSelectCategory,
}) => {
  const [hoveredCard, setHoveredCard] = useState<ActivityCategory | null>(null);
  const [hoveredDonut, setHoveredDonut] = useState<ActivityCategory | null>(null);

  const handleCategoryClick = (cat: ActivityCategory) => {
    if (onSelectCategory) {
      onSelectCategory(cat);
    } else if (onFilterByCategory) {
      onFilterByCategory(cat);
    }
  };

  const categories = metrics.categoryTotals;
  const total = metrics.totalCo2Kg;

  // Safe SVG geometry: radius = 62 guarantees hover expansion (+2px) and localized glow stay within 160x160 area
  const size = 160;
  const baseStrokeWidth = 20;
  const radius = 62;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  // Active category telemetry for center donut label (responsive to either card or donut hover)
  const activeCat = hoveredDonut || hoveredCard;
  const activeData = activeCat ? categories.find((c) => c.category === activeCat) : null;

  return (
    <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PieChart size={18} color="var(--emerald-400)" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Emission Sources</h3>
        </div>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {total > 0 ? `${total.toFixed(1)} kg total` : 'No data yet'}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          flex: 1,
        }}
      >
        {/* SVG Donut Chart with contained visualization area */}
        <div
          style={{
            position: 'relative',
            width: `${size}px`,
            height: `${size}px`,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            style={{ overflow: 'visible' }}
            role="img"
            aria-label="Emissions Breakdown Donut Chart"
          >
            {/* Background Empty Ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="rgba(255, 255, 255, 0.06)"
              strokeWidth={baseStrokeWidth}
            />

            {total > 0 &&
              categories.map((c) => {
                const ratio = c.totalCo2 / total;
                const strokeDasharray = `${ratio * circumference} ${circumference}`;
                const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
                accumulatedPercent += ratio * 100;

                const isDonutHovered = hoveredDonut === c.category;
                const isCardActive = hoveredCard === c.category;

                return (
                  <circle
                    key={c.category}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke={c.color}
                    strokeWidth={
                      isDonutHovered
                        ? baseStrokeWidth + 2
                        : isCardActive
                        ? baseStrokeWidth + 1
                        : baseStrokeWidth
                    }
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    tabIndex={0}
                    role="button"
                    aria-label={`Category ${c.label}: ${c.totalCo2.toFixed(1)} kg CO₂, ${c.percentage}%`}
                    style={{
                      transition: 'stroke-width 0.2s ease, filter 0.2s ease',
                      // Contained, subtle drop-shadow only when directly interacting with the donut segment
                      filter: isDonutHovered ? `drop-shadow(0 0 4px ${c.color}99)` : 'none',
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                    onMouseEnter={() => setHoveredDonut(c.category)}
                    onMouseLeave={() => setHoveredDonut(null)}
                    onFocus={() => setHoveredDonut(c.category)}
                    onBlur={() => setHoveredDonut(null)}
                    onClick={() => handleCategoryClick(c.category)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCategoryClick(c.category);
                      }
                    }}
                  />
                );
              })}
          </svg>

          {/* Dynamic Interactive Center Label */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              zIndex: 2,
              transition: 'all 0.2s ease',
            }}
          >
            <span
              style={{
                fontSize: '1.45rem',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                color: activeData ? activeData.color : '#FFFFFF',
                transition: 'color 0.2s ease',
              }}
            >
              {activeData ? activeData.totalCo2.toFixed(1) : total.toFixed(1)}
            </span>
            <span
              style={{
                fontSize: '0.72rem',
                color: activeData ? activeData.color : 'var(--text-muted)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
                transition: 'color 0.2s ease',
              }}
            >
              {activeData ? `${activeData.label} (${activeData.percentage}%)` : 'kg CO₂ Total'}
            </span>
          </div>
        </div>

        {/* Legend / Category breakdown rows */}
        <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {categories.map((c) => {
            const isHovered = hoveredCard === c.category || hoveredDonut === c.category;

            return (
              <div
                key={c.category}
                tabIndex={0}
                role="button"
                aria-label={`Inspect ${c.label} details: ${c.totalCo2.toFixed(1)} kg CO₂ (${c.percentage}%)`}
                onMouseEnter={() => setHoveredCard(c.category)}
                onMouseLeave={() => setHoveredCard(null)}
                onFocus={() => setHoveredCard(c.category)}
                onBlur={() => setHoveredCard(null)}
                onClick={() => handleCategoryClick(c.category)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCategoryClick(c.category);
                  }
                }}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px 10px 16px',
                  borderRadius: 'var(--radius-md)',
                  // Normal: dark surface; Hovered: slightly brighter surface with subtle category wash
                  background: isHovered
                    ? `linear-gradient(90deg, ${c.color}20 0%, rgba(18, 26, 42, 0.88) 100%)`
                    : 'rgba(10, 18, 30, 0.7)',
                  // Normal: subtle border; Hovered: stronger colored border
                  border: `1px solid ${isHovered ? c.color : 'var(--border-subtle)'}`,
                  // Hovered: layered tight soft colored aura (8-16px range) + subtle inner highlight + dark depth elevation
                  boxShadow: isHovered
                    ? `0 4px 12px -2px rgba(0, 0, 0, 0.45), 0 0 12px 1px ${c.color}38, 0 0 4px 0px ${c.color}50, inset 0 0 8px 0px ${c.color}24`
                    : 'none',
                  outline: isHovered ? `2px solid ${c.color}55` : 'none',
                  outlineOffset: '2px',
                  cursor: 'pointer',
                  transform: isHovered ? 'translateX(3px)' : 'translateX(0)',
                  transition:
                    'background var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast), transform var(--transition-fast)',
                }}
              >
                {/* Left accent indicator strip with localized glow on hover */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '4px',
                    bottom: '4px',
                    width: '3px',
                    borderRadius: '0 2px 2px 0',
                    backgroundColor: isHovered ? c.color : 'transparent',
                    boxShadow: isHovered ? `0 0 8px ${c.color}` : 'none',
                    transition: 'background-color var(--transition-fast), box-shadow var(--transition-fast)',
                  }}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ color: c.color, display: 'flex', alignItems: 'center' }}>{CATEGORY_ICONS[c.category]}</div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{c.label}</span>
                      {isHovered && (
                        <span style={{ fontSize: '0.68rem', color: c.color, fontFamily: 'var(--font-mono)' }}>
                          Details →
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {c.count} {c.count === 1 ? 'activity' : 'activities'}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.94rem', color: c.color }}>
                    {c.totalCo2.toFixed(1)} kg
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {c.percentage}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
