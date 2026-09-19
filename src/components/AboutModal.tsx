import React from 'react';
import { X, Globe, Heart, Shield, Award } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="about-title">
      <div className="modal-dialog" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(45, 106, 79, 0.12)',
                color: 'var(--forest-800)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Globe size={18} />
            </div>
            <div>
              <h2 id="about-title" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--forest-950)' }}>
                About Carbon Pulse
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Turning awareness into measurable, sustained climate action
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon" aria-label="Close about modal">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', lineHeight: 1.6 }}>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
            Carbon Pulse was created under the conviction that individual climate empowerment shouldn&apos;t feel like a punitive audit or a complex industrial spreadsheet.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div
              style={{
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                background: '#fafbfa',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <Award size={18} color="var(--forest-800)" style={{ marginBottom: '6px' }} />
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--forest-950)' }}>
                DEFRA & IPCC AR6
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Grounded in empirical conversion factors for cars, public transit, short-haul flights, and regional energy grids.
              </p>
            </div>

            <div
              style={{
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                background: '#fafbfa',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <Shield size={18} color="var(--forest-800)" style={{ marginBottom: '6px' }} />
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--forest-950)' }}>
                100% Local Privacy
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Zero surveillance. No third-party trackers, cloud databases, or behavioral profiling. Your footprint stays strictly yours.
              </p>
            </div>
          </div>

          <div
            style={{
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(45, 106, 79, 0.06)',
              border: '1px solid rgba(45, 106, 79, 0.16)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <Heart size={20} color="var(--forest-700)" />
            <span style={{ fontSize: '0.82rem', color: 'var(--forest-900)' }}>
              Built for the Hackathon Round 2 with Apple-level design restraint and nature-inspired aesthetics.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn btn-primary btn-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
