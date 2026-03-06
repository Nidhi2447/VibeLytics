import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { Users, Sparkles, Smile, Meh, Frown, HelpCircle, ChevronDown, CheckCircle2, TrendingUp, TrendingDown, Clock, FileText, Bell, PlayCircle, AlertCircle, Flame, Target, RefreshCcw } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import WelcomeTour from '../components/WelcomeTour';

// --- Helpers ---
function getVibeColor(score) {
  if (score >= 75) return '#22c55e'
  if (score >= 50) return '#f59e0b'
  return '#ef4444'
}

const EMOTION_CONFIG = {
  happy:   { Icon: Smile,       label: 'Happy',    color: '#22c55e' },
  calm:    { Icon: Meh,         label: 'Calm',     color: '#38bdf8' },
  confused:{ Icon: HelpCircle,  label: 'Confused', color: '#f59e0b' },
  sad:     { Icon: Frown,       label: 'Sad',      color: '#ef4444' }
}

function EmotionBadge({ emotion, size = 28 }) {
  const cfg = EMOTION_CONFIG[emotion] || EMOTION_CONFIG.happy
  const Icon = cfg.Icon
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: cfg.color }}>
      <Icon size={size} strokeWidth={2} />
      {cfg.label}
    </span>
  )
}

// Skeleton loader
function Skeleton({ width = '100%', height = 24, style = {} }) {
  return (
    <div style={{
      width, height,
      background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      borderRadius: '8px',
      ...style
    }} />
  )
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { activeClass, setActiveClass, alerts, setTodaySessions: setCtxTodaySessions } = useAppContext();

  const [newSubject, setNewSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTour, setShowTour] = useState(false);

  // Real data from backend
  const [todaySessions, setTodaySessions] = useState(0);
  const [todayAvgEngagement, setTodayAvgEngagement] = useState(0);
  const [mostCommonEmotion, setMostCommonEmotion] = useState('N/A');
  const [lastSession, setLastSession] = useState(null);
  const [backendAlerts, setBackendAlerts] = useState([]);

  // Streak & progress (Problem 3)
  const [streak, setStreak] = useState(0);
  const [weekOverWeekChange, setWeekOverWeekChange] = useState(0);
  const [bestSessionThisWeek, setBestSessionThisWeek] = useState(null);
  const [insightRefreshedAt, setInsightRefreshedAt] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [insightTrend, setInsightTrend] = useState('stable');
  const [dailyInsight, setDailyInsight] = useState('Start your first monitoring session to receive personalized AI insights about your classroom engagement patterns.');

  const latestAlert = alerts.length > 0 ? alerts[0] : null;

  const sparklineData = lastSession
    ? [{ value: 65 }, { value: 72 }, { value: 80 }, { value: Math.round(lastSession.avgEngagement * 0.9) }, { value: Math.round(lastSession.avgEngagement) }]
    : [{ value: 65 }, { value: 72 }, { value: 85 }, { value: 81 }, { value: 88 }];

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch summary data
      const summaryRes = await fetch('http://localhost:3001/api/reports/summary?teacherId=teacher-001');
      const data = await summaryRes.json();
      
      setTodaySessions(data.todaySessions || 0);
      setCtxTodaySessions(data.todaySessions || 0);
      setTodayAvgEngagement(data.todayAvgEngagement || 0);
      setMostCommonEmotion(data.mostCommonEmotion || 'N/A');
      setLastSession(data.lastSession || null);
      setStreak(data.streak || 0);
      setWeekOverWeekChange(data.weekOverWeekChange || 0);
      setBestSessionThisWeek(data.bestSessionThisWeek || null);
      
      // Derive trend
      if ((data.weekOverWeekChange || 0) > 3) setInsightTrend('improving');
      else if ((data.weekOverWeekChange || 0) < -3) setInsightTrend('declining');
      else setInsightTrend('stable');
      
      // Fetch daily insight from Bedrock if we have sessions
      if (data.totalSessions > 0 && data.lastSession) {
        try {
          const insightRes = await fetch('http://localhost:3001/api/insights/daily', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              avgEngagement: data.todayAvgEngagement || data.avgEngagement,
              mostCommonEmotion: data.mostCommonEmotion,
              weekOverWeekChange: data.weekOverWeekChange,
              totalSessions: data.totalSessions,
              activeClass: activeClass
            })
          });
          
          if (insightRes.ok) {
            const insightData = await insightRes.json();
            setDailyInsight(insightData.insight || 'Your students are showing consistent engagement patterns.');
            setInsightRefreshedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          }
        } catch (err) {
          console.error('Failed to fetch daily insight:', err);
          // Keep default insight
        }
      }
      
    } catch (err) {
      setError('Could not load dashboard data.');
    } finally {
      setLoading(false);
    }

    // Fetch alerts
    fetch('http://localhost:3001/api/alerts?teacherId=teacher-001&dismissed=false&limit=3')
      .then(r => r.json())
      .then(data => setBackendAlerts(data.alerts || []))
      .catch(() => setBackendAlerts([]));
  };

  useEffect(() => { 
    loadDashboardData(); 
    
    // Show tour on first visit
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    if (!hasSeenTour) {
      setTimeout(() => setShowTour(true), 1000); // Delay 1s for better UX
    }
  }, []);

  const handleTourComplete = () => {
    localStorage.setItem('hasSeenTour', 'true');
    setShowTour(false);
  };

  const handleStartSession = () => {
    const trimmedSubject = newSubject.trim();
    const subjectLower = trimmedSubject.toLowerCase();
    const invalidSubjects = ['test', 'qwe', 'asd', 'abc', '123', 'asdf'];

    if (trimmedSubject.length < 3) {
      setSubjectError('Subject name must be at least 3 characters');
      setTimeout(() => setSubjectError(null), 2500);
      return;
    }
    if (invalidSubjects.some(inv => subjectLower === inv)) {
      setSubjectError('Please enter a real subject name');
      setTimeout(() => setSubjectError(null), 2500);
      return;
    }

    setSubjectError(null);
    navigate('/live', { state: { subject: trimmedSubject } });
  };

  const hasAnySessions = lastSession !== null || todaySessions > 0;

  return (
    <>
      {/* Welcome Tour */}
      {showTour && <WelcomeTour onComplete={handleTourComplete} />}
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 className="page-title">Morning Briefing</h1>
          </div>
          <p className="page-subtitle">Pre-session summary and daily insights for {activeClass}</p>
        </div>
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

      {/* Alert Banner */}
      {latestAlert && (
        <div className="alert-banner" style={{
          backgroundColor: latestAlert.type === 'danger' ? 'var(--danger-light)' : latestAlert.type === 'warning' ? '#fef9c3' : '#dcfce7',
          border: `1px solid ${latestAlert.type === 'danger' ? '#fca5a5' : latestAlert.type === 'warning' ? '#fde047' : '#86efac'}`,
          animation: 'slideDown 0.4s ease-out',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 2rem', borderRadius: 'var(--radius-card)', marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', color: latestAlert.type === 'danger' ? 'var(--danger)' : latestAlert.type === 'warning' ? 'var(--warning)' : 'var(--success)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <latestAlert.icon size={24} />
            </div>
            <div>
              <h3 style={{ color: latestAlert.type === 'danger' ? 'var(--danger)' : latestAlert.type === 'warning' ? '#a16207' : 'var(--success)', fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.25rem' }}>{latestAlert.title}</h3>
              <p style={{ color: latestAlert.type === 'danger' ? 'var(--danger)' : latestAlert.type === 'warning' ? '#a16207' : 'var(--success)', opacity: 0.9, fontSize: '0.9rem', fontWeight: 600 }}>{latestAlert.desc}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {(latestAlert.type === 'danger' || latestAlert.type === 'warning') && (
              <button onClick={() => navigate('/live')} style={{ backgroundColor: latestAlert.type === 'danger' ? 'var(--danger)' : '#ca8a04', color: '#fff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-pill)', fontWeight: 700, cursor: 'pointer', transition: 'opacity 0.2s', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                Address Now
              </button>
            )}
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '12px', padding: '1rem 1.5rem', marginBottom: '1.5rem', color: '#b91c1c' }}>
          <AlertCircle size={18} />
          <span style={{ fontWeight: 600, flexGrow: 1 }}>{error}</span>
          <button onClick={loadDashboardData} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '0.4rem 1rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>Retry</button>
        </div>
      )}

      {/* ROW 1: Today's Snapshot Cards */}
      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Today's Snapshot</h3>

      {/* Welcome empty state (Fix 7) */}
      {!loading && !hasAnySessions ? (
        <div className="soft-card" style={{ padding: '2rem', marginBottom: '2rem', textAlign: 'center', border: '2px dashed #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem', color: 'var(--primary)' }}>
            <Users size={40} strokeWidth={1.5} />
          </div>
          <h3 style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Welcome to Vibelytics!</h3>
          <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.95rem' }}>
            Start your first session below to begin tracking classroom engagement.
          </p>
        </div>
      ) : (
        <div className="dash-top-cards" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '2rem', marginTop: 0 }}>
          <div className="soft-card" style={{ padding: '1.5rem' }}>
            <div className="card-title" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TODAY'S SESSIONS</div>
            {loading ? <Skeleton height={48} style={{ marginTop: '0.5rem' }} /> : (
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.5rem', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                {todaySessions} <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>completed</span>
              </div>
            )}
          </div>

          <div className="soft-card" style={{ padding: '1.5rem' }}>
            <div className="card-title" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TODAY'S AVG ENGAGEMENT</div>
            {loading ? <Skeleton height={48} style={{ marginTop: '0.5rem' }} /> : (
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: todayAvgEngagement > 0 ? getVibeColor(todayAvgEngagement) : 'var(--text-muted)', marginTop: '0.5rem', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                {todayAvgEngagement > 0 ? Math.round(todayAvgEngagement) + '%' : '--'}
                {todayAvgEngagement > 0 && <TrendingUp size={20} color={getVibeColor(todayAvgEngagement)} />}
              </div>
            )}
          </div>

          <div className="soft-card" style={{ padding: '1.5rem' }}>
            <div className="card-title" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MOST COMMON EMOTION</div>
            {loading ? <Skeleton height={48} style={{ marginTop: '0.5rem' }} /> : (
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {mostCommonEmotion !== 'N/A' ? <EmotionBadge emotion={mostCommonEmotion} size={26} /> : '--'}
              </div>
            )}
          </div>

          <div className="soft-card" style={{ padding: '1.5rem', border: '2px solid var(--danger-light)' }}>
            <div className="card-title" style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>STUDENTS FLAGGED TODAY</div>
            {loading ? <Skeleton height={48} style={{ marginTop: '0.5rem' }} /> : (
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--danger)', marginTop: '0.5rem', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                {backendAlerts.length} <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--danger)' }}>{backendAlerts.length === 1 ? 'alert' : 'alerts'}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Teaching Streak Bar (Problem 3) */}
      {!loading && hasAnySessions && (
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '0.75rem 1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', paddingRight: '1.5rem', borderRight: '1px solid #e2e8f0', marginRight: '1.5rem' }}>
            <Flame size={18} color={streak > 0 ? '#f97316' : '#cbd5e1'} fill={streak > 0 ? '#f97316' : 'none'} />
            <span style={{ fontWeight: 800, color: streak > 0 ? '#f97316' : 'var(--text-muted)', fontSize: '0.9rem' }}>
              {streak > 0 ? `${streak}-day teaching streak` : 'Start your streak today'}
            </span>
          </div>
          {weekOverWeekChange !== 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', paddingRight: '1.5rem', borderRight: '1px solid #e2e8f0', marginRight: '1.5rem' }}>
              {weekOverWeekChange > 0
                ? <TrendingUp size={16} color='#22c55e' />
                : <TrendingDown size={16} color='#ef4444' />}
              <span style={{ fontWeight: 700, color: weekOverWeekChange > 0 ? '#22c55e' : '#ef4444', fontSize: '0.85rem' }}>
                Engagement {weekOverWeekChange > 0 ? 'up' : 'down'} {Math.abs(weekOverWeekChange)}% vs last week
              </span>
            </div>
          )}
          {bestSessionThisWeek && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Target size={16} color='var(--primary)' />
              <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.85rem' }}>
                Best session: {bestSessionThisWeek.subject} ({bestSessionThisWeek.avgVibe}%)
              </span>
            </div>
          )}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem', marginBottom: '2rem' }}>

        {/* Last Session Recap (hidden if no sessions) */}
        {(loading || hasAnySessions) && (
          <div className="soft-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="card-title" style={{ textTransform: 'none', fontSize: '1.1rem', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Last Session Recap
              {lastSession && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {new Date(lastSession.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flexGrow: 1 }}>
                <Skeleton height={32} width="60%" />
                <Skeleton height={60} />
                <Skeleton height={50} />
              </div>
            ) : lastSession ? (
              <div style={{ flexGrow: 1 }}>
                <h4 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.5rem' }}>{lastSession.subject}</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.25rem' }}>DURATION</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={16} /> {lastSession.duration}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.25rem' }}>AVG VIBE</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: getVibeColor(lastSession.avgEngagement), display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Sparkles size={16} /> {lastSession.avgEngagement > 0 ? Math.round(lastSession.avgEngagement) + '%' : '--'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.25rem' }}>PEAK EMOTION</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <EmotionBadge emotion={lastSession.peakEmotion} size={18} />
                    </div>
                  </div>
                </div>
                <div style={{ height: '50px', width: '100%', marginBottom: '1.5rem' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparklineData}>
                      <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>
                No sessions yet
              </div>
            )}
            <button onClick={() => navigate('/reports')} style={{ width: '100%', padding: '0.75rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s' }}>
              <FileText size={16} /> View Full Report
            </button>
          </div>
        )}

        {/* AWS Bedrock Daily Insight */}
        <div className="soft-card" style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', flexDirection: 'column', gridColumn: (loading || hasAnySessions) ? undefined : '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid #dbeafe', paddingBottom: '0.75rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e40af', fontWeight: 800, fontSize: '1.1rem' }}>
              <Sparkles size={18} fill="#3b82f6" /> AWS Bedrock Daily Insight
            </span>
            {/* Trend Badge */}
            <span style={{
              padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.5px',
              backgroundColor: insightTrend === 'improving' ? '#dcfce7' : insightTrend === 'declining' ? '#fef3c7' : '#dbeafe',
              color: insightTrend === 'improving' ? '#16a34a' : insightTrend === 'declining' ? '#d97706' : '#1d4ed8'
            }}>
              {insightTrend === 'improving' ? 'IMPROVING' : insightTrend === 'declining' ? 'DECLINING' : 'STABLE'}
            </span>
          </div>
          <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <p style={{ fontSize: '1.05rem', color: '#1e3a8a', lineHeight: 1.6, fontWeight: 500 }}>
              {dailyInsight}
            </p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #dbeafe' }}>
            <span style={{ fontSize: '0.75rem', color: '#93c5fd', fontWeight: 600 }}>Refreshed today at {insightRefreshedAt}</span>
            <button onClick={loadDashboardData} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <RefreshCcw size={12} /> Refresh insight
            </button>
          </div>
        </div>
      </div>

      {/* ROW 3: Start Session + Recent Alerts */}
      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Upcoming & Actions</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>

        <div className="soft-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ flexGrow: 1 }}>
            <input
              type="text"
              placeholder="Enter subject (e.g., Intro to Algebra)..."
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleStartSession()}
              style={{ width: '100%', padding: '1rem 1.25rem', border: '2px solid #e2e8f0', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <button
            onClick={handleStartSession}
            style={{ backgroundColor: 'var(--primary)', color: '#fff', border: 'none', padding: '1rem 2rem', borderRadius: '12px', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 4px 15px rgba(56, 189, 248, 0.4)', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
          >
            <PlayCircle size={24} /> Start Next Session
          </button>
        </div>

        {/* Recent Alerts (Fix 8) */}
        <div className="soft-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-title" style={{ textTransform: 'none', fontSize: '0.9rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
            Recent Flags <Bell size={14} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flexGrow: 1 }}>
            {alerts.length === 0 && backendAlerts.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0' }}>
                <CheckCircle2 size={16} color="#22c55e" /> No active alerts
              </div>
            ) : (
              alerts.slice(0, 3).map((alert) => {
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
              })
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          from { background-position: 200% 0; }
          to { background-position: -200% 0; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
