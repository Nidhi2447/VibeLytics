import React from 'react';

export default function LoadingSpinner({ size = 'medium', message = 'Loading...' }) {
  const sizes = {
    small: { spinner: 24, border: 3 },
    medium: { spinner: 48, border: 4 },
    large: { spinner: 64, border: 5 }
  };
  
  const { spinner, border } = sizes[size];
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      padding: '2rem'
    }}>
      <div style={{
        width: `${spinner}px`,
        height: `${spinner}px`,
        border: `${border}px solid #f1f5f9`,
        borderTop: `${border}px solid var(--primary)`,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <div style={{
        fontSize: '0.9rem',
        fontWeight: 600,
        color: 'var(--text-muted)'
      }}>
        {message}
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
