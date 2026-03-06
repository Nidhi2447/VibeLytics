import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, AlertCircle, CheckCircle2, X, Volume2, VolumeX, Trash2 } from 'lucide-react';
import { api } from '../api';
import AlertsPanel from '../components/AlertsPanel';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filter, setFilter] = useState('active'); // active, all

  useEffect(() => {
    loadAlerts();
  }, [filter]);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const dismissed = filter === 'all' ? 'all' : 'false';
      const result = await api.getAlerts('teacher-001', dismissed, 50);
      setAlerts(result.alerts || []);
    } catch (err) {
      console.error('Failed to load alerts:', err);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async (alertId) => {
    try {
      await api.dismissAlert('teacher-001', alertId);
      setAlerts(prev => prev.filter(a => a.id !== alertId));
    } catch (err) {
      console.error('Failed to dismiss alert:', err);
    }
  };

  const handleDismissAll = async () => {
    if (!window.confirm('Dismiss all active alerts?')) return;
    
    try {
      await api.dismissAllAlerts('teacher-001');
      setAlerts([]);
    } catch (err) {
      console.error('Failed to dismiss all alerts:', err);
    }
  };

  const activeAlerts = alerts.filter(a => !a.dismissed);
  const displayAlerts = filter === 'active' ? activeAlerts : alerts;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Alert Center</h1>
          <p className="page-subtitle">Manage and review classroom alerts</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {activeAlerts.length > 0 && (
            <button
              onClick={handleDismissAll}
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fca5a5',
                color: '#ef4444',
                padding: '0.6rem 1.25rem',
                borderRadius: 'var(--radius-pill)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fee2e2'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fef2f2'}
            >
              <Trash2 size={14} /> Dismiss All
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div className="soft-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={20} color="#ef4444" />
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>ACTIVE ALERTS</div>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ef4444' }}>
            {activeAlerts.length}
          </div>
        </div>

        <div className="soft-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={20} color="#f59e0b" />
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>CONFUSION SPIKES</div>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f59e0b' }}>
            {alerts.filter(a => a.type === 'confusion_spike').length}
          </div>
        </div>

        <div className="soft-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertCircle size={20} color="#ef4444" />
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>LOW ENGAGEMENT</div>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ef4444' }}>
            {alerts.filter(a => a.type === 'low_engagement').length}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid #f1f5f9' }}>
        <button
          onClick={() => setFilter('active')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            borderBottom: filter === 'active' ? '3px solid var(--primary)' : '3px solid transparent',
            color: filter === 'active' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 800,
            fontSize: '0.9rem',
            transition: 'all 0.2s',
            marginBottom: '-2px'
          }}
        >
          Active ({activeAlerts.length})
        </button>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            borderBottom: filter === 'all' ? '3px solid var(--primary)' : '3px solid transparent',
            color: filter === 'all' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 800,
            fontSize: '0.9rem',
            transition: 'all 0.2s',
            marginBottom: '-2px'
          }}
        >
          All History ({alerts.length})
        </button>
      </div>

      {/* Alerts List */}
      <div className="soft-card" style={{ padding: '1.5rem' }}>
        {loading ? (
          <LoadingSpinner size="medium" message="Loading alerts..." />
        ) : (
          <AlertsPanel
            alerts={displayAlerts}
            onDismiss={handleDismiss}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled(!soundEnabled)}
          />
        )}
      </div>
    </div>
  );
}
