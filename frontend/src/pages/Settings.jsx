import React, { useState } from 'react';
import { User, Bell, Camera, Shield, Zap } from 'lucide-react';

export default function Settings() {
  const [threshold, setThreshold] = useState(40);

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account and application preferences.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'flex-start' }}>
        
        {/* Profile Settings */}
        <div className="soft-card">
           <div className="card-title" style={{ textTransform: 'none', fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <User size={20} className="text-primary" /> Profile Settings
           </div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
             <div>
               <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>Full Name</label>
               <input defaultValue="Dr. Sarah Miller" style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }} />
             </div>
             <div>
               <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>Role</label>
               <input defaultValue="Head Teacher" style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }} />
             </div>
             <div>
               <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>School / Institution</label>
               <input defaultValue="Springfield High School" style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }} />
             </div>
             <button className="btn-solid" style={{ alignSelf: 'flex-start', padding: '0.5rem 1.5rem', borderRadius: 'var(--radius-pill)', marginTop: '0.5rem' }}>Save Changes</button>
           </div>
        </div>

        {/* Notifications & System */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="soft-card">
             <div className="card-title" style={{ textTransform: 'none', fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <Bell size={20} className="text-warning" /> Alert Preferences
             </div>
             
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>Low Engagement Alerts</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>Confusion Spikes</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>Student Offline Notifications</span>
                </label>

                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Engagement Alert Threshold</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--danger)' }}>Below {threshold}%</span>
                   </div>
                   <input 
                     type="range" 
                     min="10" max="90" 
                     value={threshold} 
                     onChange={(e) => setThreshold(e.target.value)}
                     style={{ width: '100%', accentColor: 'var(--danger)' }} 
                   />
                </div>
             </div>
          </div>

          <div className="soft-card">
             <div className="card-title" style={{ textTransform: 'none', fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <Camera size={20} className="text-main" /> Hardware & Plan
             </div>
             
             <div>
               <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>Default Camera Source</label>
               <select style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', backgroundColor: '#fff', marginBottom: '1.5rem' }}>
                 <option>FaceTime HD Camera (Built-in)</option>
                 <option>Logitech C920 Pro Webcam</option>
                 <option>OBS Virtual Camera</option>
               </select>
             </div>

             <div style={{ backgroundColor: 'var(--primary-light)', borderRadius: '12px', padding: '1.25rem', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
               <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                 <Zap size={18} />
               </div>
               <div>
                 <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '0.2rem' }}>PRO PLAN ACTIVE</h4>
                 <p style={{ fontSize: '0.8rem', color: '#1e40af', lineHeight: 1.4 }}>You have access to unlimited session history and premium Bedrock AI insights.</p>
               </div>
             </div>
          </div>

        </div>

      </div>
    </>
  );
}
