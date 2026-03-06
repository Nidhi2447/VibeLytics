import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Download, Calendar, Filter, FileText, Sparkles, Users, Target, Clock, Smile, Meh, HelpCircle, Frown, ChevronDown, RefreshCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

const EMOTION_CONFIG = {
  happy: { Icon: Smile, label: 'Happy', color: '#22c55e' },
  calm: { Icon: Meh, label: 'Calm', color: '#38bdf8' },
  confused: { Icon: HelpCircle, label: 'Confused', color: '#f59e0b' },
  sad: { Icon: Frown, label: 'Sad', color: '#ef4444' }
};

function EmotionBadge({ emotion, size = 20 }) {
  const cfg = EMOTION_CONFIG[emotion] || EMOTION_CONFIG.happy;
  const Icon = cfg.Icon;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: cfg.color }}>
      <Icon size={size} strokeWidth={2} />
      {cfg.label}
    </span>
  );
}

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [timeRange, setTimeRange] = useState('week'); // week, month, all
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [compareMode, setCompareMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Reset to page 1 when filter changes
    setCurrentPage(1);
  }, [selectedSubject]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load minSessionDuration from settings
      const savedSettings = localStorage.getItem('vibelytics-settings');
      let minSessionDuration = 1; // Default to 1 minute
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          minSessionDuration = settings.minSessionDuration || 1;
        } catch (e) {
          console.error('Failed to parse settings:', e);
        }
      }
      
      const result = await api.getReports('teacher-001', minSessionDuration);
      setData(result);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    alert('PDF export feature coming soon!');
  };

  const exportToCSV = () => {
    console.log('Export CSV clicked!');
    console.log('Data:', data);
    console.log('Past sessions:', data?.pastSessions);
    
    if (!data || !data.pastSessions) {
      console.error('No data available for export');
      alert('No data available to export');
      return;
    }

    // Use filtered sessions to respect subject filter
    const sessionsToExport = selectedSubject === 'all'
      ? data.pastSessions
      : data.pastSessions.filter(s => s.subject === selectedSubject);

    console.log('Sessions to export:', sessionsToExport.length);

    const headers = ['Date', 'Subject', 'Duration', 'Avg Engagement', 'Peak Emotion'];
    const rows = sessionsToExport.map(s => [
      s.date,
      s.subject,
      s.duration,
      `${s.avgVibe}%`,
      s.peakEmotion
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    console.log('CSV Content:', csvContent);

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    const filterSuffix = selectedSubject === 'all' ? 'all' : selectedSubject.toLowerCase().replace(/\s+/g, '-');
    a.download = `vibelytics-report-${filterSuffix}-${new Date().toISOString().split('T')[0]}.csv`;
    
    console.log('Triggering download:', a.download);
    a.click();
    window.URL.revokeObjectURL(url);
    
    console.log('Export complete!');
  };

  if (loading) {
    return (
      <div>
        <h1 className="page-title">Analytics & Reports</h1>
        <p className="page-subtitle">Historical engagement data and insights</p>
        <LoadingSpinner size="large" message="Loading analytics..." />
      </div>
    );
  }

  if (!data || data.totalSessions === 0) {
    return (
      <div>
        <h1 className="page-title">Analytics & Reports</h1>
        <p className="page-subtitle">Historical engagement data and insights</p>

        <div className="soft-card" style={{ padding: '3rem', textAlign: 'center', marginTop: '2rem' }}>
          <FileText size={64} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <h3 style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            No Data Yet
          </h3>
          <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '1rem' }}>
            Complete your first session to see analytics and reports here.
          </p>
        </div>
      </div>
    );
  }

  const filteredSessions = selectedSubject === 'all'
    ? data.pastSessions
    : data.pastSessions.filter(s => s.subject === selectedSubject);

  const subjects = ['all', ...new Set(data.pastSessions.map(s => s.subject))];

  // Pagination logic
  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSessions = filteredSessions.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Analytics & Reports</h1>
          <p className="page-subtitle">Historical engagement data and insights</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={loadData}
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '0.6rem 1rem',
              borderRadius: 'var(--radius-pill)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--text-main)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
          >
            <RefreshCcw size={14} /> Refresh
          </button>

          <button
            onClick={exportToCSV}
            style={{
              backgroundColor: 'var(--primary)',
              color: '#fff',
              border: 'none',
              padding: '0.6rem 1.25rem',
              borderRadius: 'var(--radius-pill)',
              fontWeight: 700,
              fontSize: '0.85rem',
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
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div className="soft-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} color="var(--primary)" />
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>TOTAL SESSIONS</div>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {data.totalSessions}
          </div>
        </div>

        <div className="soft-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={20} color="#22c55e" />
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>AVG ENGAGEMENT</div>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#22c55e' }}>
            {data.avgEngagement}%
          </div>
        </div>

        <div className="soft-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={20} color="#f59e0b" />
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>BEST SUBJECT</div>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
            {data.bestSubject}
          </div>
        </div>

        <div className="soft-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} color="var(--primary)" />
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>TOTAL TIME</div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {Math.round(data.pastSessions.reduce((sum, s) => sum + (s.durationMins || 0), 0) / 60)}h
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Weekly Trend */}
        <div className="soft-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Weekly Engagement Trend
            </h3>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', fontWeight: 700 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: 'var(--primary)' }} />
                Engagement
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: '#f59e0b' }} />
                Confusion
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fontWeight: 600 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fontWeight: 600 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}
              />
              <Line type="monotone" dataKey="engagement" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="confusion" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Subject Performance */}
        <div className="soft-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.5rem' }}>
            Subject Performance
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {data.subjectEngagement.slice(0, 5).map((subject, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {subject.subject}
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: subject.color === 'green' ? '#22c55e' : subject.color === 'amber' ? '#f59e0b' : '#ef4444' }}>
                    {subject.engagement}%
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${subject.engagement}%`,
                    height: '100%',
                    backgroundColor: subject.color === 'green' ? '#22c55e' : subject.color === 'amber' ? '#f59e0b' : '#ef4444',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Session History */}
      <div className="soft-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Session History
          </h3>

          {/* Subject filter */}
          <div style={{ position: 'relative' }}>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              style={{
                appearance: 'none',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '0.5rem 2rem 0.5rem 1rem',
                borderRadius: 'var(--radius-pill)',
                fontWeight: 700,
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {subjects.map(sub => (
                <option key={sub} value={sub}>
                  {sub === 'all' ? 'All Subjects' : sub}
                </option>
              ))}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Date</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Subject</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Duration</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Engagement</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Peak Emotion</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Summary</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSessions.map((session, idx) => (
                <tr key={session.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '1rem 0.75rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {session.date}
                  </td>
                  <td style={{ padding: '1rem 0.75rem', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {session.subject}
                  </td>
                  <td style={{ padding: '1rem 0.75rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {session.duration}
                  </td>
                  <td style={{ padding: '1rem 0.75rem' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      backgroundColor: session.vibeColor === 'green' ? '#dcfce7' : session.vibeColor === 'amber' ? '#fef9c3' : '#fef2f2',
                      color: session.vibeColor === 'green' ? '#22c55e' : session.vibeColor === 'amber' ? '#f59e0b' : '#ef4444'
                    }}>
                      {session.avgVibe}%
                    </span>
                  </td>
                  <td style={{ padding: '1rem 0.75rem' }}>
                    <EmotionBadge emotion={session.peakEmotion} size={18} />
                  </td>
                  <td style={{ padding: '1rem 0.75rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', maxWidth: '300px' }}>
                    {session.summary || 'No summary available'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSessions.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            No sessions found for the selected filter
          </div>
        )}

        {/* Pagination Controls */}
        {filteredSessions.length > itemsPerPage && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid #f1f5f9'
          }}>
            {/* Page info */}
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Showing {startIndex + 1}-{Math.min(endIndex, filteredSessions.length)} of {filteredSessions.length} sessions
            </div>

            {/* Page buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  backgroundColor: currentPage === 1 ? '#f8fafc' : '#fff',
                  border: '1px solid #e2e8f0',
                  color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-main)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  transition: 'all 0.2s',
                  opacity: currentPage === 1 ? 0.5 : 1
                }}
                onMouseEnter={e => {
                  if (currentPage !== 1) e.currentTarget.style.backgroundColor = '#f8fafc';
                }}
                onMouseLeave={e => {
                  if (currentPage !== 1) e.currentTarget.style.backgroundColor = '#fff';
                }}
              >
                <ChevronLeft size={16} /> Previous
              </button>

              {/* Page numbers */}
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                  // Show first page, last page, current page, and pages around current
                  const showPage = page === 1 || 
                                   page === totalPages || 
                                   (page >= currentPage - 1 && page <= currentPage + 1);
                  
                  const showEllipsis = (page === 2 && currentPage > 3) || 
                                       (page === totalPages - 1 && currentPage < totalPages - 2);

                  if (showEllipsis) {
                    return (
                      <span key={page} style={{ padding: '0.5rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                        ...
                      </span>
                    );
                  }

                  if (!showPage) return null;

                  return (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      style={{
                        backgroundColor: page === currentPage ? 'var(--primary)' : '#fff',
                        border: '1px solid',
                        borderColor: page === currentPage ? 'var(--primary)' : '#e2e8f0',
                        color: page === currentPage ? '#fff' : 'var(--text-main)',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        minWidth: '40px',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => {
                        if (page !== currentPage) {
                          e.currentTarget.style.backgroundColor = '#f8fafc';
                        }
                      }}
                      onMouseLeave={e => {
                        if (page !== currentPage) {
                          e.currentTarget.style.backgroundColor = '#fff';
                        }
                      }}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  backgroundColor: currentPage === totalPages ? '#f8fafc' : '#fff',
                  border: '1px solid #e2e8f0',
                  color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-main)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  transition: 'all 0.2s',
                  opacity: currentPage === totalPages ? 0.5 : 1
                }}
                onMouseEnter={e => {
                  if (currentPage !== totalPages) e.currentTarget.style.backgroundColor = '#f8fafc';
                }}
                onMouseLeave={e => {
                  if (currentPage !== totalPages) e.currentTarget.style.backgroundColor = '#fff';
                }}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
