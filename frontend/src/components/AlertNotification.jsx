import React, { useEffect, useState } from 'react';
import { AlertTriangle, AlertCircle, X } from 'lucide-react';

export default function AlertNotification({ alert, onDismiss, autoHide = true, duration = 5000 }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoHide, duration]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss();
    }, 300);
  };

  if (!isVisible) return null;

  const isWarning = alert.type === 'confusion_spike';
  const isDanger = alert.type === 'low_engagement';
  const Icon = isWarning ? AlertTriangle : AlertCircle;
  const bgColor = isDanger ? '#fef2f2' : '#fef9c3';
  const borderColor = isDanger ? '#fca5a5' : '#fde047';
  const textColor = isDanger ? '#ef4444' : '#f59e0b';

  return (
    <div
      style={{
        position: 'fixed',
        top: '2rem',
        right: '2rem',
        zIndex: 9999,
        backgroundColor: bgColor,
        border: `2px solid ${borderColor}`,
        borderRadius: '12px',
        padding: '1rem 1.5rem',
        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
        minWidth: '320px',
        maxWidth: '400px',
        animation: isExiting ? 'slideOutRight 0.3s ease-out' : 'slideInRight 0.3s ease-out'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
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
          <Icon size={20} color={textColor} />
        </div>

        <div style={{ flexGrow: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '1rem',
            fontWeight: 800,
            color: textColor,
            marginBottom: '0.25rem'
          }}>
            {isDanger ? 'Low Engagement Alert' : 'Confusion Spike Detected'}
          </div>
          <div style={{
            fontSize: '0.9rem',
            fontWeight: 600,
            color: textColor,
            opacity: 0.9,
            lineHeight: 1.4
          }}>
            {alert.title}
          </div>
        </div>

        <button
          onClick={handleDismiss}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: textColor,
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

      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideOutRight {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(100px);
          }
        }
      `}</style>
    </div>
  );
}
