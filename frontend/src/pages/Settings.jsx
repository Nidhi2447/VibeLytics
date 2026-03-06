import React, { useState, useEffect } from 'react';
import { User, Bell, Camera, Zap, Save, Volume2, VolumeX, Database, Download, Trash2, CheckCircle2, AlertCircle, Palette, Shield } from 'lucide-react';

const TEACHER_ID = 'teacher-001';

// Move components outside to prevent recreation on every render
const SettingRow = ({ label, children, description }) => (
  <div style={{ padding: '1.25rem 0', borderBottom: '1px solid #f1f5f9' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: description ? '0.5rem' : 0 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: description ? '0.25rem' : 0 }}>{label}</div>
        {description && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{description}</div>}
      </div>
      <div style={{ marginLeft: '2rem' }}>{children}</div>
    </div>
  </div>
);

const Toggle = ({ checked, onChange }) => (
  <div 
    onClick={() => onChange(!checked)}
    style={{
      width: '48px', height: '26px', borderRadius: '13px', cursor: 'pointer',
      backgroundColor: checked ? 'var(--primary)' : '#cbd5e1',
      position: 'relative', transition: 'all 0.2s', flexShrink: 0
    }}
  >
    <div style={{
      width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#fff',
      position: 'absolute', top: '2px', left: checked ? '24px' : '2px',
      transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    }} />
  </div>
);

export default function Settings() {
  const [activeSection, setActiveSection] = useState('profile');
  const [fullName, setFullName] = useState('Dr. Sarah Miller');
  const [role, setRole] = useState('Head Teacher');
  const [institution, setInstitution] = useState('Springfield High School');
  const [email, setEmail] = useState('sarah.miller@springfield.edu');
  const [lowEngagementAlerts, setLowEngagementAlerts] = useState(true);
  const [confusionAlerts, setConfusionAlerts] = useState(true);
  const [offlineAlerts, setOfflineAlerts] = useState(false);
  const [threshold, setThreshold] = useState(40);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [alertCooldown, setAlertCooldown] = useState(15); // New: Alert cooldown in seconds
  const [minSessionDuration, setMinSessionDuration] = useState(1); // New: Minimum session duration in minutes (default 1)
  const [darkMode, setDarkMode] = useState(false);
  const [compactView, setCompactView] = useState(false);
  const [dateFormat, setDateFormat] = useState('US');
  const [defaultCamera, setDefaultCamera] = useState('built-in');
  const [videoQuality, setVideoQuality] = useState('high');
  const [frameRate, setFrameRate] = useState('3');
  const [saveStatus, setSaveStatus] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('vibelytics-settings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        setFullName(settings.fullName || 'Dr. Sarah Miller');
        setRole(settings.role || 'Head Teacher');
        setInstitution(settings.institution || 'Springfield High School');
        setEmail(settings.email || 'sarah.miller@springfield.edu');
        setLowEngagementAlerts(settings.lowEngagementAlerts ?? true);
        setConfusionAlerts(settings.confusionAlerts ?? true);
        setOfflineAlerts(settings.offlineAlerts ?? false);
        setThreshold(settings.threshold || 40);
        setSoundEnabled(settings.soundEnabled ?? true);
        setAlertCooldown(settings.alertCooldown || 15);
        setMinSessionDuration(settings.minSessionDuration || 1);
        setDarkMode(settings.darkMode ?? false);
        setCompactView(settings.compactView ?? false);
        setDateFormat(settings.dateFormat || 'US');
        setDefaultCamera(settings.defaultCamera || 'built-in');
        setVideoQuality(settings.videoQuality || 'high');
        setFrameRate(settings.frameRate || '3');
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    }
  }, []);

  const handleSave = () => {
    setSaveStatus('saving');
    setSaveMessage('Saving settings...');
    const settings = {
      fullName, role, institution, email, lowEngagementAlerts, confusionAlerts,
      offlineAlerts, threshold, soundEnabled, alertCooldown, minSessionDuration,
      darkMode, compactView, dateFormat, defaultCamera, videoQuality, frameRate,
      savedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem('vibelytics-settings', JSON.stringify(settings));
      setSaveStatus('success');
      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (e) {
      setSaveStatus('error');
      setSaveMessage('Failed to save settings');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handleExportData = () => {
    const data = {
      settings: JSON.parse(localStorage.getItem('vibelytics-settings') || '{}'),
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vibelytics-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all local data? This cannot be undone.')) {
      localStorage.removeItem('vibelytics-settings');
      localStorage.removeItem('hasSeenTour');
      setSaveStatus('success');
      setSaveMessage('Local data cleared');
      setTimeout(() => { setSaveStatus(null); window.location.reload(); }, 2000);
    }
  };

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'camera', label: 'Camera & Performance', icon: Camera },
    { id: 'data', label: 'Data & Privacy', icon: Shield },
    { id: 'plan', label: 'Subscription', icon: Zap }
  ];

  return (
    <div style={{ display: 'flex', gap: '2rem', height: 'calc(100vh - 180px)' }}>
      {/* Sidebar Navigation */}
      <div style={{ width: '240px', flexShrink: 0 }}>
        <div className="soft-card" style={{ padding: '0.5rem', position: 'sticky', top: '1rem' }}>
          {sections.map(section => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                style={{
                  width: '100%', padding: '0.75rem 1rem', border: 'none',
                  backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                  borderRadius: '8px', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem',
                  transition: 'all 0.2s', textAlign: 'left',
                  color: isActive ? 'var(--primary)' : 'var(--text-main)',
                  fontWeight: isActive ? 800 : 600, fontSize: '0.9rem'
                }}
                onMouseEnter={e => !isActive && (e.currentTarget.style.backgroundColor = '#f8fafc')}
                onMouseLeave={e => !isActive && (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {section.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Settings</h1>
            <p className="page-subtitle">Manage your preferences and account settings</p>
          </div>
          <button onClick={handleSave} disabled={saveStatus === 'saving'} style={{
            backgroundColor: saveStatus === 'success' ? '#22c55e' : 'var(--primary)',
            color: '#fff', border: 'none', padding: '0.65rem 1.5rem',
            borderRadius: 'var(--radius-pill)', fontWeight: 700, fontSize: '0.85rem',
            cursor: saveStatus === 'saving' ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            transition: 'all 0.2s', opacity: saveStatus === 'saving' ? 0.6 : 1,
            boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)'
          }}>
            {saveStatus === 'success' ? <CheckCircle2 size={16} /> : <Save size={16} />}
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'success' ? 'Saved!' : 'Save Changes'}
          </button>
        </div>

        {/* Status Message */}
        {saveStatus && (
          <div style={{
            marginBottom: '1.5rem', padding: '1rem 1.25rem', borderRadius: '12px',
            backgroundColor: saveStatus === 'success' ? '#dcfce7' : saveStatus === 'error' ? '#fee2e2' : '#e0f2fe',
            border: `1px solid ${saveStatus === 'success' ? '#22c55e' : saveStatus === 'error' ? '#ef4444' : '#38bdf8'}`,
            display: 'flex', alignItems: 'center', gap: '0.75rem', animation: 'slideDown 0.3s ease'
          }}>
            {saveStatus === 'success' ? <CheckCircle2 size={20} color="#22c55e" /> : <AlertCircle size={20} color={saveStatus === 'error' ? '#ef4444' : '#38bdf8'} />}
            <span style={{ fontWeight: 600, color: saveStatus === 'success' ? '#166534' : saveStatus === 'error' ? '#991b1b' : '#075985' }}>
              {saveMessage}
            </span>
          </div>
        )}

        {/* Content Area */}
        <div className="soft-card" style={{ padding: '0' }}>
          <div style={{ padding: '2rem', maxHeight: 'calc(100vh - 320px)', overflowY: 'auto' }}>

            {/* Profile Section */}
            {activeSection === 'profile' && (
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Profile Information</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>Update your personal information and account details</p>
                
                <SettingRow label="Full Name">
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ width: '300px', padding: '0.65rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', fontWeight: 600 }} />
                </SettingRow>
                <SettingRow label="Email Address">
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '300px', padding: '0.65rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', fontWeight: 600 }} />
                </SettingRow>
                <SettingRow label="Role / Position">
                  <input value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '300px', padding: '0.65rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', fontWeight: 600 }} />
                </SettingRow>
                <SettingRow label="Institution">
                  <input value={institution} onChange={(e) => setInstitution(e.target.value)} style={{ width: '300px', padding: '0.65rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', fontWeight: 600 }} />
                </SettingRow>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Notification Preferences</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>Manage how and when you receive alerts</p>
                
                <SettingRow label="Low Engagement Alerts" description="Get notified when classroom engagement drops below your threshold">
                  <Toggle checked={lowEngagementAlerts} onChange={setLowEngagementAlerts} />
                </SettingRow>
                <SettingRow label="Confusion Spike Alerts" description="Receive alerts when multiple students show confusion">
                  <Toggle checked={confusionAlerts} onChange={setConfusionAlerts} />
                </SettingRow>
                <SettingRow label="Student Offline Notifications" description="Alert when students disconnect from the session">
                  <Toggle checked={offlineAlerts} onChange={setOfflineAlerts} />
                </SettingRow>
                <SettingRow label="Alert Sound Effects" description="Play sound when alerts are triggered">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {soundEnabled ? <Volume2 size={18} color="var(--primary)" /> : <VolumeX size={18} color="var(--text-muted)" />}
                    <Toggle checked={soundEnabled} onChange={setSoundEnabled} />
                  </div>
                </SettingRow>
                
                <div style={{ padding: '1.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem' }}>Engagement Alert Threshold</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Alert when engagement drops below</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--danger)' }}>{threshold}%</span>
                  </div>
                  <input type="range" min="10" max="90" value={threshold} onChange={(e) => setThreshold(e.target.value)} style={{ width: '100%', accentColor: 'var(--danger)', cursor: 'pointer', height: '6px' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>10%</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>90%</span>
                  </div>
                </div>

                <div style={{ padding: '1.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem' }}>Alert Cooldown Period</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Minimum time between same alert types</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)' }}>{alertCooldown} seconds</span>
                  </div>
                  <input type="range" min="5" max="120" step="5" value={alertCooldown} onChange={(e) => setAlertCooldown(e.target.value)} style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer', height: '6px' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>5s</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>2min</span>
                  </div>
                </div>

                <div style={{ padding: '1.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem' }}>Minimum Session Duration</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Only include sessions longer than</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--success)' }}>{minSessionDuration} minutes</span>
                  </div>
                  <input type="range" min="1" max="30" value={minSessionDuration} onChange={(e) => setMinSessionDuration(e.target.value)} style={{ width: '100%', accentColor: 'var(--success)', cursor: 'pointer', height: '6px' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>1 min</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>30 min</span>
                  </div>
                  <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Sessions shorter than this duration will be excluded from reports and analytics
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Section */}
            {activeSection === 'appearance' && (
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Appearance & Display</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>Customize how Vibelytics looks and feels</p>
                
                <SettingRow label="Dark Mode" description="Switch to dark theme (Coming Soon)">
                  <Toggle checked={darkMode} onChange={setDarkMode} />
                </SettingRow>
                <SettingRow label="Compact Dashboard View" description="Show more information in less space">
                  <Toggle checked={compactView} onChange={setCompactView} />
                </SettingRow>
                <SettingRow label="Date Format" description="Choose how dates are displayed">
                  <select value={dateFormat} onChange={(e) => setDateFormat(e.target.value)} style={{ width: '200px', padding: '0.65rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', backgroundColor: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                    <option value="US">MM/DD/YYYY (US)</option>
                    <option value="UK">DD/MM/YYYY (UK)</option>
                    <option value="ISO">YYYY-MM-DD (ISO)</option>
                  </select>
                </SettingRow>
              </div>
            )}

            {/* Camera Section */}
            {activeSection === 'camera' && (
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Camera & Performance</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>Configure video capture and analysis settings</p>
                
                <SettingRow label="Default Camera" description="Select which camera to use for live sessions">
                  <select value={defaultCamera} onChange={(e) => setDefaultCamera(e.target.value)} style={{ width: '250px', padding: '0.65rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', backgroundColor: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                    <option value="built-in">Built-in Camera</option>
                    <option value="external">External Webcam</option>
                    <option value="virtual">Virtual Camera</option>
                  </select>
                </SettingRow>
                <SettingRow label="Video Quality" description="Higher quality uses more bandwidth">
                  <select value={videoQuality} onChange={(e) => setVideoQuality(e.target.value)} style={{ width: '250px', padding: '0.65rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', backgroundColor: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                    <option value="low">Low (480p) - Faster</option>
                    <option value="medium">Medium (720p) - Balanced</option>
                    <option value="high">High (1080p) - Best Quality</option>
                  </select>
                </SettingRow>
                <SettingRow label="Analysis Frame Rate" description="How often to analyze emotions (lower = less CPU usage)">
                  <select value={frameRate} onChange={(e) => setFrameRate(e.target.value)} style={{ width: '250px', padding: '0.65rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', backgroundColor: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                    <option value="1">Every 1 second - High CPU</option>
                    <option value="3">Every 3 seconds - Balanced</option>
                    <option value="5">Every 5 seconds - Low CPU</option>
                    <option value="10">Every 10 seconds - Minimal</option>
                  </select>
                </SettingRow>
              </div>
            )}

            {/* Data & Privacy Section */}
            {activeSection === 'data' && (
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Data & Privacy</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>Manage your data and privacy preferences</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <button onClick={handleExportData} style={{ width: '100%', padding: '1rem 1.25rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-main)', transition: 'all 0.2s', textAlign: 'left' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f8fafc'}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Download size={20} color="var(--primary)" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, marginBottom: '0.25rem' }}>Export Settings Data</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Download your settings as a JSON file</div>
                    </div>
                  </button>

                  <button onClick={handleClearData} style={{ width: '100%', padding: '1rem 1.25rem', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', color: '#991b1b', transition: 'all 0.2s', textAlign: 'left' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fecaca'} onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fee2e2'}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #fecaca' }}>
                      <Trash2 size={20} color="#991b1b" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, marginBottom: '0.25rem' }}>Clear All Local Data</div>
                      <div style={{ fontSize: '0.8rem', color: '#991b1b', fontWeight: 600, opacity: 0.8 }}>Remove all settings and cached data</div>
                    </div>
                  </button>

                  <div style={{ marginTop: '1rem', padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
                      <Shield size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Privacy Notice</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                          All settings are stored locally in your browser. No personal data is sent to external servers except video frames to AWS Rekognition for emotion analysis during live sessions. Session data is stored in AWS DynamoDB.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Subscription Section */}
            {activeSection === 'plan' && (
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Subscription Plan</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>Manage your subscription and billing</p>
                
                <div style={{ backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '16px', padding: '2rem', marginBottom: '2rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
                      <Zap size={24} color="#fff" />
                    </div>
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.25rem' }}>PRO PLAN</div>
                      <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Unlimited sessions & premium AI insights</div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '1rem', backdropFilter: 'blur(10px)' }}>
                      <div style={{ fontSize: '0.75rem', opacity: 0.9, marginBottom: '0.5rem' }}>SESSIONS THIS MONTH</div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>24</div>
                    </div>
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '1rem', backdropFilter: 'blur(10px)' }}>
                      <div style={{ fontSize: '0.75rem', opacity: 0.9, marginBottom: '0.5rem' }}>TOTAL HOURS</div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>18.5</div>
                    </div>
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '1rem', backdropFilter: 'blur(10px)' }}>
                      <div style={{ fontSize: '0.75rem', opacity: 0.9, marginBottom: '0.5rem' }}>NEXT BILLING</div>
                      <div style={{ fontSize: '1rem', fontWeight: 800 }}>Mar 15</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Plan Status</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Active subscription</div>
                    </div>
                    <div style={{ padding: '0.4rem 0.75rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>ACTIVE</div>
                  </div>
                  <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Billing Cycle</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Monthly subscription</div>
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>$29/month</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
