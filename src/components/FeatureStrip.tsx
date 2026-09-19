import React from 'react';
import { Leaf, BarChart3, Target, Sprout } from 'lucide-react';

interface FeatureStripProps {
  onTrackClick: () => void;
  onInsightsClick: () => void;
  onGoalsClick: () => void;
  onSolutionsClick: () => void;
}

export const FeatureStrip: React.FC<FeatureStripProps> = ({
  onTrackClick,
  onInsightsClick,
  onGoalsClick,
  onSolutionsClick,
}) => {
  const items = [
    {
      id: 'track',
      title: 'Track Activities',
      description: 'Log your daily choices',
      icon: <Leaf size={22} />,
      onClick: onTrackClick,
    },
    {
      id: 'insights',
      title: 'Get Insights',
      description: 'Understand your impact',
      icon: <BarChart3 size={22} />,
      onClick: onInsightsClick,
    },
    {
      id: 'goals',
      title: 'Set Goals',
      description: 'Build better habits',
      icon: <Target size={22} />,
      onClick: onGoalsClick,
    },
    {
      id: 'action',
      title: 'Take Action',
      description: 'Get personalized tips',
      icon: <Sprout size={22} />,
      onClick: onSolutionsClick,
    },
  ];

  return (
    <section aria-label="Quick Feature Access" className="feature-strip-grid">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={item.onClick}
          className="feature-pill-card"
          type="button"
          aria-label={`${item.title}: ${item.description}`}
        >
          <div className="feature-icon-circle" aria-hidden="true">
            {item.icon}
          </div>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '0.98rem',
                color: 'var(--text-primary)',
                letterSpacing: '-0.01em',
              }}
            >
              {item.title}
            </div>
            <div
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                marginTop: '2px',
              }}
            >
              {item.description}
            </div>
          </div>
        </button>
      ))}
    </section>
  );
};
