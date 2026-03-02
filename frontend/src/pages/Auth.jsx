import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Mail, Lock, User, ArrowRight } from 'lucide-react';
import './Auth.css'; // We'll put the complex sliding animations here

export default function Auth() {
  // true = shows Sign In (left panel active), false = shows Sign Up (right panel active)
  const [isLoginActive, setIsLoginActive] = useState(true);
  const navigate = useNavigate();

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    navigate('/');
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <div className="auth-wrapper">
      
      {/* 
        The main container holding both forms and the overlay. 
        When right-panel-active is added, the CSS handles moving the overlay.
      */}
      <div className={`auth-container ${isLoginActive ? '' : 'right-panel-active'}`}>
        
        {/* =========================================
            SIGN UP FORM (Hidden on the right initially)
            ========================================= */}
        <div className="form-container sign-up-container">
          <form onSubmit={handleSignupSubmit}>
            <h1 style={{ marginBottom: '1.5rem', fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>Create Account</h1>
            
            <div className="input-field">
              <User size={18} className="input-icon" />
              <input type="text" placeholder="Full Name" required />
            </div>
            
            <div className="input-field">
              <Mail size={18} className="input-icon" />
              <input type="email" placeholder="Email Address" required />
            </div>
            
            <div className="input-field">
              <Lock size={18} className="input-icon" />
              <input type="password" placeholder="Password" required />
            </div>

            <button type="submit" className="btn-solid" style={{ marginTop: '1rem' }}>
              Sign Up <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
            </button>
          </form>
        </div>

        {/* =========================================
            SIGN IN FORM (Visible on the left initially)
            ========================================= */}
        <div className="form-container sign-in-container">
          <form onSubmit={handleLoginSubmit}>
            <h1 style={{ marginBottom: '1.5rem', fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>Sign in</h1>
            
            <div className="input-field">
              <Mail size={18} className="input-icon" />
              <input type="email" placeholder="Email Address" required />
            </div>
            
            <div className="input-field">
              <Lock size={18} className="input-icon" />
              <input type="password" placeholder="Password" required />
            </div>

            <a href="#" className="forgot-password">Forgot your password?</a>
            
            <button type="submit" className="btn-solid" style={{ marginTop: '0.5rem' }}>
              Sign In <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
            </button>
          </form>
        </div>

        {/* =========================================
            SLIDING OVERLAY PANEL
            ========================================= */}
        <div className="overlay-container">
          <div className="overlay">
            
            {/* The text shown when Login form is active (Overlay is on the right) */}
            <div className="overlay-panel overlay-left">
              <div style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%', marginBottom: '1.5rem' }}>
                 <BarChart3 size={32} color="#fff" strokeWidth={3} />
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>Welcome Back!</h1>
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem', marginBottom: '2.5rem', padding: '0 2rem' }}>
                To keep connected with your students, please login with your personal info
              </p>
              <button 
                className="btn-outline" 
                onClick={() => setIsLoginActive(true)}
              >
                Sign In
              </button>
            </div>

            {/* The text shown when Signup form is active (Overlay is on the left) */}
            <div className="overlay-panel overlay-right">
              <div style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%', marginBottom: '1.5rem' }}>
                 <BarChart3 size={32} color="#fff" strokeWidth={3} />
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>Hello, Friend!</h1>
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem', marginBottom: '2.5rem', padding: '0 2rem' }}>
                Enter your details and start journey with Vibelytics
              </p>
              <button 
                className="btn-outline" 
                onClick={() => setIsLoginActive(false)}
              >
                Sign Up
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
