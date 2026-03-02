import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { Users, Sparkles, Navigation, Smile, AlertTriangle, ChevronDown, CheckCircle2, TrendingUp, Clock, FileText, Bell, PlayCircle, Plus } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { 
    activeClass, setActiveClass,
    alerts 
  } = useAppContext();

  // State for the inline new session subject
  const [newSubject, setNewSubject] = useState('');

  // Grab the latest alert for the Top Banner
  const latestAlert = alerts.length > 0 ? alerts[0] : null;

  // Mock Sparkline Data
  const sparklineData = [
    { value: 65 }, { value: 72 }, { value: 85 }, { value: 81 }, { value: 88 }
  ];

  const handleStartSession = () => {
    // Just navigate to live feed
    navigate('/live');
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 className="page-title">Morning Briefing</h1>
          </div>
          <p className="page-subtitle">Pre-session summary and daily insights for {activeClass}</p>
        </div>
        
        {/* Top Right Section Selector */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <select 
              value={activeClass}
              onChange={(e) => setActiveClass(e.target.value)}
              style={{ appearance: 'none', backgroundColor: '#fff', border: '1px solid #e2e8f0', padding: '0.6rem 2.5rem 0.6rem 1.25rem', borderRadius: 'var(--radius-pill)', fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem', cursor: 'pointer', outline: 'none', boxShadow: 'var(--shadow-sm)' }}
            >
              <option value="Section 10-A">Section 10-A</option>
              <option value="Section 10-B">Section 10-B</option>
              <option value="Section 10-C">Section 10-C</option>
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
          </div>
        </div>
      </div>

      {/* Dynamic Global Alert Banner */}
      {latestAlert && (
         <div className="alert-banner" style={{ 
           backgroundColor: latestAlert.type === 'danger' ? 'var(--danger-light)' : latestAlert.type === 'warning' ? '#fef9c3' : '#dcfce7', 
           border: `1px solid ${latestAlert.type === 'danger' ? '#fca5a5' : latestAlert.type === 'warning' ? '#fde047' : '#86efac'}`,
           animation: 'slideDown 0.4s ease-out',
           display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 2rem', borderRadius: 'var(--radius-card)', marginBottom: '2rem'
         }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
               <div className="alert-icon-circle" style={{ width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', color: latestAlert.type === 'danger' ? 'var(--danger)' : latestAlert.type === 'warning' ? 'var(--warning)' : 'var(--success)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  <latestAlert.icon size={24} />
               </div>
               <div>
                  <h3 style={{ color: latestAlert.type === 'danger' ? 'var(--danger)' : latestAlert.type === 'warning' ? '#a16207' : 'var(--success)', fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.25rem' }}>{latestAlert.title}</h3>
                  <p style={{ color: latestAlert.type === 'danger' ? 'var(--danger)' : latestAlert.type === 'warning' ? '#a16207' : 'var(--success)', opacity: 0.9, fontSize: '0.9rem', fontWeight: 600 }}>{latestAlert.desc}</p>
               </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
               {(latestAlert.type === 'danger' || latestAlert.type === 'warning') && (
                 <button 
                   onClick={() => navigate('/live')}
                   style={{ backgroundColor: latestAlert.type === 'danger' ? 'var(--danger)' : '#ca8a04', color: '#fff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-pill)', fontWeight: 700, cursor: 'pointer', transition: 'opacity 0.2s', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                 >
                   Address Now
                 </button>
               )}
            </div>
         </div>
      )}

      {/* ROW 1: PRE-SESSION SNAPSHOT CARDS */}
      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Today's Snapshot</h3>
      <div className="dash-top-cards" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '2rem', marginTop: 0 }}>
        
        <div className="soft-card" style={{ padding: '1.5rem' }}>
          <div className="card-title" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TODAY'S SESSIONS</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.5rem', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            2 <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>completed</span>
          </div>
        </div>

        <div className="soft-card" style={{ padding: '1.5rem' }}>
          <div className="card-title" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TODAY'S AVG ENGAGEMENT</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.5rem', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            81% <TrendingUp size={20} className="text-success" />
          </div>
        </div>

        <div className="soft-card" style={{ padding: '1.5rem' }}>
          <div className="card-title" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MOST COMMON EMOTION</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Smile size={32} className="text-success" /> Happy
          </div>
        </div>

        <div className="soft-card" style={{ padding: '1.5rem', border: '2px solid var(--danger-light)' }}>
          <div className="card-title" style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>STUDENTS FLAGGED TODAY</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--danger)', marginTop: '0.5rem', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            3 <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--danger)' }}>needs review</span>
          </div>
        </div>

      </div>

      {/* ROW 2: LAST SESSION RECAP & AI INSIGHT */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem', marginBottom: '2rem' }}>
         
         {/* Left: Last Session Recap */}
         <div className="soft-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="card-title" style={{ textTransform: 'none', fontSize: '1.1rem', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', flexShrink: 0 }}>
               Last Session Recap
               <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Yesterday, 10:00 AM</span>
            </div>
            
            <div style={{ flexGrow: 1 }}>
               <h4 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.5rem' }}>Physics 101</h4>
               
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                 <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.25rem' }}>DURATION</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={16} /> 45 min</div>
                 </div>
                 <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.25rem' }}>AVG VIBE</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Sparkles size={16} /> 88%</div>
                 </div>
                 <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.25rem' }}>PEAK EMOTION</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Smile size={16} className="text-success" /> Happy</div>
                 </div>
               </div>

               {/* Mini Sparkline */}
               <div style={{ height: '50px', width: '100%', marginBottom: '1.5rem' }}>
                 <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={sparklineData}>
                     <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={3} dot={false} />
                   </LineChart>
                 </ResponsiveContainer>
               </div>
            </div>

            <button onClick={() => navigate('/reports')} style={{ width: '100%', padding: '0.75rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s' }}>
              <FileText size={16} /> View Full Report
            </button>
         </div>

         {/* Right: AWS Bedrock Daily Insight */}
         <div className="soft-card" style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', flexDirection: 'column' }}>
            <div className="card-title" style={{ textTransform: 'none', fontSize: '1.1rem', marginBottom: '1.5rem', borderBottom: '1px solid #dbeafe', paddingBottom: '0.75rem', color: '#1e40af' }}>
               <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Sparkles size={18} fill="#3b82f6" /> AWS Bedrock Daily Insight</span>
               <span style={{ backgroundColor: '#dcfce7', color: 'var(--success)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-pill)', fontSize: '0.75rem', fontWeight: 800 }}>IMPROVING</span>
            </div>
            
            <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
              <p style={{ fontSize: '1.15rem', color: '#1e3a8a', lineHeight: 1.6, fontWeight: 500 }}>
                "Your Thursday classes consistently drop in engagement after 45 mins. Consider introducing a 5-minute interactive poll or short break to reset student focus. Overall, your average engagement for {activeClass} is up 4% compared to last week."
              </p>
            </div>
         </div>

      </div>

      {/* ROW 3: UPCOMING & ACTIONS */}
      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Upcoming & Actions</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
         
         {/* Start Session Module */}
         <div className="soft-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ flexGrow: 1 }}>
              <input 
                 type="text" 
                 placeholder="Enter subject (e.g., Intro to Algebra)..." 
                 value={newSubject}
                 onChange={(e) => setNewSubject(e.target.value)}
                 style={{ width: '100%', padding: '1rem 1.25rem', border: '2px solid #e2e8f0', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', outline: 'none' }}
              />
            </div>
            <button 
              onClick={handleStartSession}
              style={{ backgroundColor: 'var(--primary)', color: '#fff', border: 'none', padding: '1rem 2rem', borderRadius: '12px', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 4px 15px rgba(56, 189, 248, 0.4)', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
            >
              <PlayCircle size={24} /> Start Next Session
            </button>
         </div>

         {/* Compact Recent Alerts */}
         <div className="soft-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="card-title" style={{ textTransform: 'none', fontSize: '0.9rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
               Recent Flags <Bell size={14} style={{ marginLeft: 'auto' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {alerts.slice(0, 3).map((alert) => {
                const LocalIcon = alert.icon;
                const fgC = alert.type === 'danger' ? 'var(--danger)' : alert.type === 'warning' ? 'var(--warning)' : 'var(--success)';
                return (
                  <div key={alert.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ color: fgC, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <LocalIcon size={16} />
                    </div>
                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{alert.title}</div>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600 }}>{alert.time}</span>
                  </div>
                );
              })}
            </div>
         </div>

      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
