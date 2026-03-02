import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

export default function SessionAnalytics() {
  const timeGraphData = [
    { time: '09:00 AM', engagement: 10 },
    { time: '09:30 AM', engagement: 30 },
    { time: '10:00 AM', engagement: 20 },
    { time: '10:15 AM', engagement: 68 },
    { time: '10:30 AM', engagement: 85 },
    { time: '11:00 AM', engagement: 55 },
    { time: '11:30 AM', engagement: 40 },
    { time: '11:45 AM', engagement: 82 },
    { time: '12:00 PM', engagement: 65 },
    { time: '12:30 PM', engagement: 45 },
    { time: '01:00 PM', engagement: 50 },
  ];

  return (
    <>
      <div className="analytics-header-section">
        <div>
           <div className="sub">RETRO OS V1.0.4</div>
           <h2>SESSION ANALYTICS</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span style={{ fontWeight: 800, fontSize: '0.75rem' }}>SELECT SESSION</span>
          <select className="neo-select" defaultValue="Morning Workshop A1">
            <option>Morning Workshop A1</option>
            <option>Afternoon Lecture B4</option>
            <option>Evening Lab C2</option>
          </select>
        </div>
      </div>

      <div className="analytics-top-stats">
        
        <div className="neo-box">
          <div className="neo-box-header" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
             <TrendingUp size={16} /> AVERAGE ENGAGEMENT
          </div>
          <div className="neo-box-body analytics-single-stat">
            <div className="val">72%</div>
            <div className="subval text-teal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
              <TrendingUp size={16} strokeWidth={3} /> +12% vs last session
            </div>
          </div>
        </div>

        <div className="neo-box">
          <div className="neo-box-header" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
             <TrendingUp size={16} style={{ transform: 'rotate(45deg)' }} /> PEAK ENGAGEMENT
          </div>
          <div className="neo-box-body analytics-single-stat">
            <div className="val text-orange">89%</div>
            <div className="subval text-muted">RECORDED AT 10:15 AM</div>
          </div>
        </div>

        <div className="neo-box">
          <div className="neo-box-header" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
             <AlertTriangle size={16} /> LOWEST MOMENT
          </div>
          <div className="neo-box-body analytics-single-stat">
            <div className="val" style={{ color: '#94a3b8' }}>45%</div>
            <div className="subval text-muted">RECORDED AT 11:05 AM</div>
          </div>
        </div>

      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        
        {/* Left Col: Area Chart */}
        <div className="neo-box">
          <div className="neo-box-header bg-orange">
             <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={16} />
                ENGAGEMENT OVER TIME
             </span>
             <div style={{ display: 'flex', gap: '4px' }}>
                <div style={{ width: '12px', height: '12px', border: '2px solid #fff' }}></div>
                <div style={{ width: '12px', height: '12px', border: '2px solid #fff' }}></div>
             </div>
          </div>
          <div className="neo-box-body" style={{ height: '350px', paddingLeft: 0, paddingBottom: 0 }}>
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeGraphData} margin={{ top: 20, right: 20, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="time" axisLine={{stroke: '#e2e8f0', strokeWidth: 2}} tickLine={false} tick={{dy: 10}} ticks={['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM']} />
                  <YAxis domain={[0, 100]} axisLine={{stroke: '#e2e8f0', strokeWidth: 2}} tickLine={false} width={40} ticks={[0, 50, 100]} tickFormatter={(val) => `${val}%`} />
                  <Area type="linear" dataKey="engagement" stroke="var(--neo-orange)" fill="rgba(249, 115, 22, 0.15)" strokeWidth={5} activeDot={{ r: 6, stroke: 'var(--border-color)', strokeWidth: 2, fill: '#fff' }} />
                </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Right Col: Bar Charts */}
        <div className="neo-box" style={{ paddingBottom: '2rem' }}>
          <div className="neo-box-header bg-navy">
             <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '14px' }}>
                  <div style={{ width: '4px', height: '8px', backgroundColor: '#fff' }}></div>
                  <div style={{ width: '4px', height: '14px', backgroundColor: '#fff' }}></div>
                </div>
                TEACHING METHOD COMPARISON
             </span>
             <div style={{ width: '12px', height: '12px', border: '2px solid #fff' }}></div>
          </div>
          
          <div className="neo-box-body" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
             
             <div>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                 <span>LECTURE</span>
                 <span className="text-orange" style={{ fontSize: '1rem' }}>65%</span>
               </div>
               <div style={{ height: '24px', border: '2px solid var(--border-color)', backgroundColor: '#f1f5f9', width: '100%' }}>
                 <div style={{ height: '100%', width: '65%', backgroundColor: 'var(--neo-orange)', borderRight: '2px solid var(--border-color)' }}></div>
               </div>
             </div>

             <div>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                 <span>DISCUSSION</span>
                 <span className="text-orange" style={{ fontSize: '1rem' }}>88%</span>
               </div>
               <div style={{ height: '24px', border: '2px solid var(--border-color)', backgroundColor: '#f1f5f9', width: '100%' }}>
                 <div style={{ height: '100%', width: '88%', backgroundColor: 'var(--neo-orange)', borderRight: '2px solid var(--border-color)' }}></div>
               </div>
             </div>

             <div>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                 <span>GROUP WORK</span>
                 <span className="text-orange" style={{ fontSize: '1rem' }}>92%</span>
               </div>
               <div style={{ height: '24px', border: '2px solid var(--border-color)', backgroundColor: '#f1f5f9', width: '100%' }}>
                 <div style={{ height: '100%', width: '92%', backgroundColor: 'var(--neo-orange)', borderRight: '2px solid var(--border-color)' }}></div>
               </div>
             </div>

             <div>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                 <span>QUIZ</span>
                 <span className="text-orange" style={{ fontSize: '1rem' }}>74%</span>
               </div>
               <div style={{ height: '24px', border: '2px solid var(--border-color)', backgroundColor: '#f1f5f9', width: '100%' }}>
                 <div style={{ height: '100%', width: '74%', backgroundColor: 'var(--neo-orange)', borderRight: '2px solid var(--border-color)' }}></div>
               </div>
             </div>

          </div>
        </div>

      </div>
    </>
  );
}
