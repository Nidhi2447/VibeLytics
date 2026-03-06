import React, { useState, useEffect } from 'react';
import { Bell, X, AlertTriangle, AlertCircle, Info, CheckCircle2, Volume2, VolumeX } from 'lucide-react';

const ALERT_TYPES = {
  confusion_spike: {
    icon: AlertTriangle,
    color: '#f59e0b',
    bg: '#fef9c3',
    border: '#fde047',
    title: 'Confusion Spike Detected'
  },
  low_engagement: {
    icon: AlertCircle,
    color: '#ef4444',
    bg: '#fef2f2',
    border: '#fca5a5',
    title: 'Low Engagement Alert'
  },
  info: {
    icon: Info,
    color: '#3b82f6',
    bg: '#eff6ff',
    border: '#bfdbfe',
    title: 'Information'
  }
};

export default function AlertsPanel({ alerts = [], onDismiss, soundEnabled = true, onToggleSound }) {
  const [expandedAlerts, setExpandedAlerts] = useState(new Set());
  const audioRef = React.useRef(null);

  // Play sound when new alert arrives
  useEffect(() => {
    if (alerts.length > 0 && soundEnabled && audioRef.current) {
      const latestAlert = alerts[0];
      if (latestAlert && !latestAlert.dismissed) {
        audioRef.current.play().catch(err => console.log('Audio play failed:', err));
      }
    }
  }, [alerts.length, soundEnabled]);

  const toggleExpand = (alertId) => {
    setExpandedAlerts(prev => {
      const next = new Set(prev);
      if (next.has(alertId)) {
        next.delete(alertId);
      } else {
        next.add(alertId);
      }
      return next;
    });
  };

  if (alerts.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1rem',
        color: 'var(--text-muted)',
        textAlign: 'center'
      }}>
        <CheckCircle2 size={48} color="#22c55e" style={{ marginBottom: '1rem', opacity: 0.5 }} />
        <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          All Clear!
        </div>
        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
          No active alerts at the moment
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Sound toggle */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.5rem 0',
        borderBottom: '1px solid #f1f5f9'
      }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
          {alerts.length} Active {alerts.length === 1 ? 'Alert' : 'Alerts'}
        </span>
        <button
          onClick={onToggleSound}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: soundEnabled ? 'var(--primary)' : 'var(--text-muted)',
            fontSize: '0.8rem',
            fontWeight: 700,
            padding: '0.25rem 0.5rem',
            borderRadius: '6px',
            transition: 'background 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          Sound {soundEnabled ? 'On' : 'Off'}
        </button>
      </div>

      {/* Alert list */}
      {alerts.map((alert) => {
        const config = ALERT_TYPES[alert.type] || ALERT_TYPES.info;
        const Icon = config.icon;
        const isExpanded = expandedAlerts.has(alert.id);

        return (
          <div
            key={alert.id}
            style={{
              backgroundColor: config.bg,
              border: `2px solid ${config.border}`,
              borderRadius: '12px',
              padding: '1rem',
              animation: 'slideInRight 0.3s ease-out',
              position: 'relative'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
                <Icon size={20} color={config.color} />
              </div>

              <div style={{ flexGrow: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  color: config.color,
                  marginBottom: '0.25rem'
                }}>
                  {config.title}
                </div>
                <div style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: config.color,
                  opacity: 0.9,
                  lineHeight: 1.4
                }}>
                  {alert.title}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: config.color,
                  opacity: 0.7,
                  marginTop: '0.5rem',
                  fontWeight: 600
                }}>
                  {alert.time}
                </div>
              </div>

              <button
                onClick={() => onDismiss(alert.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: config.color,
                  opacity: 0.6,
                  padding: '0.25rem',
                  borderRadius: '4px',
                  transition: 'all 0.2s',
                  flexShrink: 0
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.opacity = '0.6';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Action button */}
            {alert.sessionId && (
              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: `1px solid ${config.border}` }}>
                <button
                  onClick={() => toggleExpand(alert.id)}
                  style={{
                    backgroundColor: config.color,
                    color: '#fff',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    width: '100%',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  {isExpanded ? 'Hide Details' : 'View Details'}
                </button>

                {isExpanded && (
                  <div style={{
                    marginTop: '0.75rem',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(255,255,255,0.5)',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: config.color
                  }}>
                    <div><strong>Session ID:</strong> {alert.sessionId}</div>
                    <div style={{ marginTop: '0.25rem' }}>
                      <strong>Recommendation:</strong> Consider taking a short break or switching to an interactive activity.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Hidden audio element for alert sound */}
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGS57OihUBELTKXh8bllHAU2jdXvzn0pBSh+zPDajzsKElyx6OyrWBUIQ5zd8sFuJAUuhM/z24k2CBhku+zooVARC0yl4fG5ZRwFNo3V7859KQUofsz" type="audio/wav" />
      </audio>

      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
