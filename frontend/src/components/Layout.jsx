import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Radio, BarChart3, Settings, Bell, ChevronRight, X, AlertTriangle, HelpCircle, WifiOff, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Layout() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { activeClass, alerts, markAllRead, isMonitoring, todaySessions } = useAppContext();

  const unreadCount = alerts.filter(n => !n.read).length;

  return (
    <div className="app-layout" style={{ position: 'relative', overflowX: 'hidden' }}>
      
      {/* Permanent Sidebar Content */}
      <aside className="sidebar">
        <NavLink to="/" className="brand-logo">
          <div className="brand-icon">
            <BarChart3 size={18} strokeWidth={3} />
          </div>
          Vibelytics
        </NavLink>
        
        <nav className="nav-menu">
          <NavLink to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <LayoutDashboard size={20} />
              Overview
            </span>
            {todaySessions > 0 && (
              <span style={{ backgroundColor: 'var(--primary)', color: '#fff', fontSize: '0.68rem', fontWeight: 800, padding: '0.1rem 0.45rem', borderRadius: '20px', lineHeight: 1.4 }}>{todaySessions}</span>
            )}
          </NavLink>
          <NavLink to="/live" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} style={{ display: 'flex', alignItems: 'center' }}>
            <Radio size={20} />
            Live Feed
            {isMonitoring && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--danger)', animation: 'pulseDot 1.5s infinite', marginLeft: 'auto' }}></div>}
          </NavLink>
          <NavLink to="/reports" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <BarChart3 size={20} />
            Reports
          </NavLink>
          <NavLink to="/alerts" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Bell size={20} />
              Alerts
            </span>
            {unreadCount > 0 && (
              <span style={{ backgroundColor: 'var(--danger)', color: '#fff', fontSize: '0.68rem', fontWeight: 800, padding: '0.1rem 0.45rem', borderRadius: '20px', lineHeight: 1.4 }}>{unreadCount}</span>
            )}
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} style={{ marginTop: '1rem' }}>
            <Settings size={20} />
            Settings
          </NavLink>
        </nav>

        {/* Pro Plan Upgrade Box at bottom of sidebar matching Image #2 */}
        <div className="pro-plan-box">
          <h4>PRO PLAN</h4>
          <p>You're currently using 84% of your bandwidth.</p>
          <button className="btn-upgrade">Upgrade Now</button>
        </div>
      </aside>

      {/* Main Action Area */}
      <main className="main-content">
        
        {/* Top Header - Breadcrumbs & Profile */}
        <header className="top-header">
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
             Dashboard <ChevronRight size={14} /> <span style={{ color: 'var(--text-main)' }}>{activeClass}</span>
           </div>
           
           <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
             <button onClick={() => setIsDrawerOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', position: 'relative' }}>
               <Bell size={20} />
               {unreadCount > 0 && <span style={{ position: 'absolute', top: -4, right: -4, backgroundColor: 'var(--danger)', width: 14, height: 14, borderRadius: '50%', border: '2px solid #fff' }}></span>}
             </button>
             <button style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>
               <Settings size={20} />
             </button>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>Dr. Sarah Miller</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>HEAD TEACHER</div>
                </div>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#fcd34d', overflow: 'hidden' }}>
                  <img src="https://i.pravatar.cc/150?img=32" alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
             </div>
           </div>
        </header>

        {/* Dynamic Route Content */}
        <div className="page-content">
          <Outlet />
        </div>

      </main>

      {/* Global Notification Drawer */}
      <div 
        style={{ 
          position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', zIndex: 9998, 
          opacity: isDrawerOpen ? 1 : 0, pointerEvents: isDrawerOpen ? 'auto' : 'none', transition: 'opacity 0.3s ease' 
        }} 
        onClick={() => setIsDrawerOpen(false)}
      ></div>

      <div 
        style={{ 
          position: 'fixed', top: 0, right: 0, bottom: 0, width: '400px', backgroundColor: '#fff', zIndex: 9999, 
          boxShadow: '-10px 0 30px rgba(0,0,0,0.1)', transform: isDrawerOpen ? 'translateX(0)' : 'translateX(100%)', 
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)', display: 'flex', flexDirection: 'column'
        }}
      >
        <div style={{ padding: '2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
             <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>Notifications</h2>
             {unreadCount > 0 && <span style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>{unreadCount} new</span>}
          </div>
          <button onClick={() => setIsDrawerOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
             <X size={24} />
          </button>
        </div>

        <div style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'flex-end', backgroundColor: '#f8fafc' }}>
           <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>Mark all as read</button>
        </div>

        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '1rem 2rem' }}>
          {alerts.length === 0 && (
             <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem', fontSize: '0.9rem' }}>No notifications to display.</div>
          )}
          {alerts.map((n) => {
             const Icon = n.icon;
             const colors = {
               warning: { bg: '#fef9c3', fg: 'var(--warning)' },
               danger:  { bg: 'var(--danger-light)', fg: 'var(--danger)' },
               success: { bg: '#dcfce7', fg: 'var(--success)' },
             };
             return (
               <div key={n.id} style={{ display: 'flex', gap: '1rem', padding: '1.25rem 0', borderBottom: '1px solid #f1f5f9', opacity: n.read ? 0.6 : 1, transition: 'opacity 0.3s' }}>
                 <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: colors[n.type].bg, color: colors[n.type].fg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                   <Icon size={18} />
                 </div>
                 <div style={{ flexGrow: 1 }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                     <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>{n.title}</div>
                     <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 500 }}>{n.time}</span>
                   </div>
                   <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.4 }}>{n.desc}</div>
                 </div>
                 {!n.read && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)', marginTop: '0.4rem' }}></div>}
               </div>
             )
          })}
        </div>

      </div>

    </div>
  );
}
