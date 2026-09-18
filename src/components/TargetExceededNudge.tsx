import React from 'react';
import { AlertTriangle, ArrowRight, Target, PlusCircle, Trees, ZapOff, ShieldAlert } from 'lucide-react';
import type { WeekMetrics } from '../types';

interface TargetExceededNudgeProps {
  metrics: WeekMetrics;
  onOpenLogModal: () => void;
  onOpenTargetModal: () => void;
  onViewHistory: () => void;
}

export const TargetExceededNudge: React.FC<TargetExceededNudgeProps> = ({
  metrics,
  onOpenLogModal,
  onOpenTargetModal,
  onViewHistory,
}) => {
  if (!metrics.isTargetExceeded) return null;

  // Tangible real-world impact equivalencies
  const treeAbsorptionDays = Math.max(Math.round(metrics.excessKg * 17.5), 1);
  const equivalentDrivingKm = Math.max(Math.round(metrics.excessKg * 5.0), 1);

  return (
    <div
      role="region"
      aria-label="Weekly Target Status"
      className="climate-overdraft-alert"
      style={{
        marginBottom: '24px',
        borderRadius: 'var(--radius-lg)',
        background: 'linear-gradient(135deg, rgba(38, 14, 24, 0.95) 0%, rgba(22, 16, 32, 0.95) 100%)',
        border: '1.5px solid rgba(244, 63, 94, 0.65)',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top urgent hazard strip */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #E11D48 0%, #F43F5E 50%, #FB923C 100%)',
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
          {/* Header Beacon & Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
            <span
              className="badge badge-rose"
              style={{
                padding: '4px 10px',
                fontSize: '0.78rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(225, 29, 72, 0.25)',
                borderColor: 'var(--rose-400)',
              }}
            >
              <ShieldAlert size={14} />
              <span>CARBON BUDGET BREACHED • CLIMATE OVERDRAFT</span>
            </span>

            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.88rem',
                color: '#FDA4AF',
                fontWeight: 700,
              }}
            >
              {metrics.totalCo2Kg.toFixed(1)} kg / {metrics.targetKg.toFixed(1)} kg ({metrics.percentUsed}% exhausted)
            </span>
          </div>

          <h3
            style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              color: '#FFFFFF',
              marginBottom: '8px',
              letterSpacing: '-0.01em',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertTriangle size={22} color="var(--rose-400)" style={{ flexShrink: 0 }} />
            <span>Weekly Carbon Budget Exceeded by +{metrics.excessKg.toFixed(1)} kg CO₂</span>
          </h3>

          <p
            style={{
              color: '#F1F5F9',
              fontSize: '0.94rem',
              lineHeight: '1.6',
              maxWidth: '720px',
              marginBottom: '14px',
            }}
          >
            <strong>Your emissions have entered an active ecological deficit.</strong> At{' '}
            <span style={{ color: 'var(--rose-400)', fontWeight: 700 }}>{metrics.percentUsed}%</span> of your
            sustainable allowance, your current weekly footprint outpaces what natural planetary cycles can absorb.
            Every further activity logged compounds this deficit.
          </p>

          {/* Concrete Real-World Impact Equivalency Strip */}
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
                background: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <Trees size={20} color="var(--amber-400)" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Sequestration Debt
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#FFFFFF' }}>
                  ~{treeAbsorptionDays} Tree-Days
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>needed to absorb this week's excess</div>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <ZapOff size={20} color="var(--rose-400)" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Combustion Equivalent
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#FFFFFF' }}>
                  ~{equivalentDrivingKm} km Car Travel
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>worth of cumulative overhead</div>
              </div>
            </div>
          </div>

          <div
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>💡 <strong>Immediate levers to flatten your curve:</strong> Opt for public transit, choose plant-based dining, and defer high-wattage appliance runs. Logging remains 100% unrestricted.</span>
          </div>
        </div>

        {/* Action Triggers */}
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
              background: 'linear-gradient(135deg, #E11D48 0%, #BE123C 100%)',
              boxShadow: '0 4px 16px rgba(225, 29, 72, 0.45)',
              fontWeight: 700,
            }}
          >
            <PlusCircle size={16} />
            <span>Log Activity</span>
          </button>

          <button onClick={onViewHistory} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
            <span>Audit Hotspots</span>
            <ArrowRight size={14} />
          </button>

          <button onClick={onOpenTargetModal} className="btn btn-secondary btn-sm" style={{ width: '100%' }} title="Calibrate weekly budget">
            <Target size={14} />
            <span>Calibrate Target</span>
          </button>
        </div>
      </div>
    </div>
  );
};
