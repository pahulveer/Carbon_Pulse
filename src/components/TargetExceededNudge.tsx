import React from 'react';
import { ArrowRight, Target, PlusCircle, Trees, Car, Sparkles, HeartHandshake } from 'lucide-react';
import type { WeekMetrics } from '../types';

interface TargetExceededNudgeProps {
  metrics: WeekMetrics;
  onOpenLogModal: () => void;
  onOpenTargetModal: () => void;
  onViewHistory: () => void;
}

/**
 * Decision Point 1 (DP1): The Nudge (Target Exceeded)
 * Core Philosophy: Encourage + inform, never shame and never block.
 * Displays clear metrics, empowering microcopy, constructive context, and zero friction.
 */
export const TargetExceededNudge: React.FC<TargetExceededNudgeProps> = ({
  metrics,
  onOpenLogModal,
  onOpenTargetModal,
  onViewHistory,
}) => {
  if (!metrics.isTargetExceeded) return null;

  // Tangible real-world impact equivalencies for grounding
  const treeAbsorptionDays = Math.max(Math.round(metrics.excessKg * 17.5), 1);
  const equivalentDrivingKm = Math.max(Math.round(metrics.excessKg * 5.0), 1);

  return (
    <div
      role="region"
      aria-label="Weekly Target Guidance"
      className="target-nudge-card"
      style={{
        marginBottom: '24px',
        borderRadius: 'var(--radius-lg)',
        background: 'linear-gradient(135deg, rgba(30, 16, 26, 0.92) 0%, rgba(18, 16, 28, 0.94) 100%)',
        border: '1.5px solid rgba(251, 113, 133, 0.4)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(244, 63, 94, 0.12)',
        padding: '22px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle top ambient indicator */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #FB7185 0%, #F43F5E 50%, #FDA4AF 100%)',
        }}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div style={{ flex: '1 1 540px' }}>
          {/* Header Badges & Metrics */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
            <span
              className="badge badge-rose"
              style={{
                padding: '4px 10px',
                fontSize: '0.76rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(244, 63, 94, 0.16)',
                borderColor: 'rgba(251, 113, 133, 0.5)',
              }}
            >
              <HeartHandshake size={14} />
              <span>WEEKLY TARGET EXCEEDED • SUPPORTIVE GUIDANCE</span>
            </span>

            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.86rem',
                color: '#FDA4AF',
                fontWeight: 700,
              }}
            >
              {metrics.totalCo2Kg.toFixed(1)} kg / {metrics.targetKg.toFixed(1)} kg (+{metrics.excessKg.toFixed(1)} kg above target)
            </span>
          </div>

          <h3
            style={{
              fontSize: '1.28rem',
              fontWeight: 800,
              color: '#FFFFFF',
              marginBottom: '8px',
              letterSpacing: '-0.01em',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Sparkles size={20} color="var(--rose-400)" style={{ flexShrink: 0 }} />
            <span>Your tracking still matters — keep going.</span>
          </h3>

          <p
            style={{
              color: '#F1F5F9',
              fontSize: '0.92rem',
              lineHeight: '1.6',
              maxWidth: '740px',
              marginBottom: '16px',
            }}
          >
            You are <strong>{metrics.excessKg.toFixed(1)} kg</strong> past your {metrics.targetKg.toFixed(1)} kg weekly allowance.
            Awareness is the first and most critical step toward high-leverage reduction.
            Continue logging your activities so you have complete data fidelity on which categories drove this week's variance.
          </p>

          {/* Constructive Real-World Impact Perspective Strip */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '10px',
              marginBottom: '14px',
            }}
          >
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid rgba(251, 113, 133, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <Trees size={20} color="var(--emerald-400)" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Absorption Context
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#FFFFFF' }}>
                  ~{treeAbsorptionDays} Tree-Days
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>to offset this week's excess</div>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid rgba(251, 113, 133, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <Car size={20} color="var(--sky-400)" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Driving Equivalence
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#FFFFFF' }}>
                  ~{equivalentDrivingKm} km Car Travel
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>in equivalent carbon volume</div>
              </div>
            </div>
          </div>

          <div
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>💡 <strong>Actionable levers:</strong> Explore public transit, plant-forward meal alternatives, or calibrate your target budget to fit your current lifestyle.</span>
          </div>
        </div>

        {/* Action Triggers — Zero Interruption */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            alignSelf: 'center',
            minWidth: '180px',
          }}
        >
          <button
            onClick={onOpenLogModal}
            className="btn btn-primary"
            style={{
              background: 'linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)',
              boxShadow: '0 4px 16px rgba(244, 63, 94, 0.35)',
              fontWeight: 700,
            }}
          >
            <PlusCircle size={16} />
            <span>Continue Logging</span>
          </button>

          <button onClick={onViewHistory} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
            <span>Audit Hotspots</span>
            <ArrowRight size={14} />
          </button>

          <button onClick={onOpenTargetModal} className="btn btn-secondary btn-sm" style={{ width: '100%' }} title="Calibrate weekly budget">
            <Target size={14} />
            <span>Adjust Budget</span>
          </button>
        </div>
      </div>
    </div>
  );
};
