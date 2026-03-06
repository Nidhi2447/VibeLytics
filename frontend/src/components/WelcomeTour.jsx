import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

const TOUR_STEPS = [
  {
    title: 'Welcome to Vibelytics! 👋',
    description: 'Your AI-powered classroom engagement monitoring platform. Let\'s take a quick tour of the key features.',
    highlight: null
  },
  {
    title: 'Dashboard Overview',
    description: 'See today\'s sessions, average engagement, and get AI-powered insights about your teaching.',
    highlight: 'dashboard'
  },
  {
    title: 'Live Feed',
    description: 'Monitor student emotions in real-time using your camera. Get instant alerts when engagement drops.',
    highlight: 'live'
  },
  {
    title: 'Reports & Analytics',
    description: 'View historical data, weekly trends, and export reports for performance reviews.',
    highlight: 'reports'
  },
  {
    title: 'Alert Center',
    description: 'Manage all your classroom alerts in one place. Never miss when students need help.',
    highlight: 'alerts'
  },
  {
    title: 'You\'re All Set! 🎉',
    description: 'Start your first monitoring session to see Vibelytics in action. Click "Start Next Session" on the dashboard.',
    highlight: null
  }
];

export default function WelcomeTour({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  
  if (!isVisible) return null;
  
  const step = TOUR_STEPS[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === TOUR_STEPS.length - 1;
  
  const handleNext = () => {
    if (isLast) {
      setIsVisible(false);
      onComplete?.();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  const handlePrev = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };
  
  const handleSkip = () => {
    setIsVisible(false);
    onComplete?.();
  };
  
  return (
    <>
      {/* Overlay */}
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        zIndex: 9998,
        backdropFilter: 'blur(2px)'
      }} />
      
      {/* Tour Card */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
        backgroundColor: '#fff',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        padding: '2rem',
        maxWidth: '500px',
        width: '90%',
        animation: 'slideIn 0.3s ease-out'
      }}>
        {/* Close button */}
        <button
          onClick={handleSkip}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            padding: '0.25rem',
            borderRadius: '4px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = '#f1f5f9';
            e.currentTarget.style.color = 'var(--text-main)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          <X size={20} />
        </button>
        
        {/* Progress dots */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          justifyContent: 'center',
          marginBottom: '1.5rem'
        }}>
          {TOUR_STEPS.map((_, index) => (
            <div
              key={index}
              style={{
                width: index === currentStep ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                backgroundColor: index === currentStep ? 'var(--primary)' : '#e2e8f0',
                transition: 'all 0.3s'
              }}
            />
          ))}
        </div>
        
        {/* Content */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: 'var(--text-main)',
            marginBottom: '1rem'
          }}>
            {step.title}
          </h2>
          <p style={{
            fontSize: '1rem',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            fontWeight: 600
          }}>
            {step.description}
          </p>
        </div>
        
        {/* Navigation */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'space-between'
        }}>
          <button
            onClick={handleSkip}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Skip Tour
          </button>
          
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {!isFirst && (
              <button
                onClick={handlePrev}
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: 'var(--text-main)',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
              >
                <ChevronLeft size={16} /> Back
              </button>
            )}
            
            <button
              onClick={handleNext}
              style={{
                backgroundColor: 'var(--primary)',
                border: 'none',
                color: '#fff',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {isLast ? 'Get Started' : 'Next'} <ChevronRight size={16} />
            </button>
          </div>
        </div>
        
        <style>{`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translate(-50%, -45%);
            }
            to {
              opacity: 1;
              transform: translate(-50%, -50%);
            }
          }
        `}</style>
      </div>
    </>
  );
}
