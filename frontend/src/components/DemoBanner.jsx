import React, { useState } from 'react';
import { Info, X } from 'lucide-react';

export default function DemoBanner() {
  const [isVisible, setIsVisible] = useState(true);
  
  if (!isVisible) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10000,
      backgroundColor: '#3b82f6',
      color: '#fff',
      padding: '0.75rem 1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <Info size={18} />
      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
        🎨 Demo Mode: This is a prototype with sample data for demonstration purposes
      </span>
      <button
        onClick={() => setIsVisible(false)}
        style={{
          background: 'none',
          border: 'none',
          color: '#fff',
          cursor: 'pointer',
          padding: '0.25rem',
          marginLeft: 'auto',
          opacity: 0.8,
          transition: 'opacity 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
        onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}
      >
        <X size={18} />
      </button>
    </div>
  );
}
