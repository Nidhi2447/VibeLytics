import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { Folder, Search, Minimize2, X, Activity } from 'lucide-react';

export default function Dashboard({ data }) {
  const total = data ? data.total_faces : 0;
  const engaged = data ? data.engaged : 0;
  const disengaged = data ? data.negative : 0;
  const neutral = data ? data.neutral : 0;

  const timelineData = [
    { time: 'T-5', value: 40 },
    { time: 'T-4', value: 65 },
    { time: 'T-3', value: 50 },
    { time: 'T-2', value: 75 },
    { time: 'T-1', value: 70 },
    { time: 'Now', value: engaged || 40 },
  ];

  return (
    <div className="retro-window">
      <div className="retro-window-header header-teal-dots">
        <span>Classroom_Overview.exe</span>
        <div className="win-close-btn">X</div>
      </div>

      <div className="dash-layout">
        
        {/* Top: Overview Metrics */}
        <div className="dash-top-metrics">
          <div className="metric-card">
            <div className="label">Total Students</div>
            <div className="value">{total > 0 ? total : '--'}</div>
          </div>
          <div className="metric-card">
            <div className="label">Engaged %</div>
            <div className="value">{engaged > 0 ? `${engaged}%` : '--'}</div>
          </div>
          <div className="metric-card">
            <div className="label">Disengaged %</div>
            <div className="value">{disengaged > 0 ? `${disengaged}%` : '--'}</div>
          </div>
        </div>

        {/* Middle: Live Graph */}
        <div className="inner-box">
          <div className="inner-box-title">
            <Activity size={16} /> Live Engagement Graph
          </div>
          <div className="engagement-graph-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="time" axisLine={{stroke: 'var(--border-color)', strokeWidth: 2}} tickLine={false} tick={{dy: 10}} />
                <YAxis dataKey="value" domain={[0, 100]} axisLine={{stroke: 'var(--border-color)', strokeWidth: 2}} tickLine={false} width={30} />
                <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} contentStyle={{border: '2.5px solid var(--border-color)', borderRadius: '4px', boxShadow: '2px 2px 0px var(--border-color)', fontWeight: '800', fontSize: '0.8rem'}} />
                <Line type="monotone" dataKey="value" stroke="var(--retro-orange)" strokeWidth={4} activeDot={{ r: 6, stroke: 'var(--border-color)', strokeWidth: 2, fill: '#fff' }} isAnimationActive={!!data} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom: Emotion Distribution */}
        <div className="inner-box">
           <div className="inner-box-title">
             <Search size={16} /> Emotion Distribution
           </div>
           
           <div style={{ marginTop: '1rem' }}>
             
             <div className="emotion-row">
               <div className="emotion-label">😊 Happy</div>
               <div className="segmented-bar-container">
                 <div className="segmented-bar-fill fill-happy" style={{ width: `${engaged}%` }}></div>
               </div>
               <div style={{width: '35px', textAlign: 'right', fontWeight: 800, fontSize: '0.8rem'}}>{engaged}%</div>
             </div>

             <div className="emotion-row">
               <div className="emotion-label">😐 Calm</div>
               <div className="segmented-bar-container">
                 <div className="segmented-bar-fill fill-calm" style={{ width: `${neutral}%` }}></div>
               </div>
               <div style={{width: '35px', textAlign: 'right', fontWeight: 800, fontSize: '0.8rem'}}>{neutral}%</div>
             </div>

             <div className="emotion-row">
               <div className="emotion-label">😕 Confsd</div>
               <div className="segmented-bar-container">
                 <div className="segmented-bar-fill fill-confused" style={{ width: `${disengaged}%` }}></div>
               </div>
               <div style={{width: '35px', textAlign: 'right', fontWeight: 800, fontSize: '0.8rem'}}>{disengaged}%</div>
             </div>

             <div className="emotion-row" style={{marginBottom: 0}}>
               <div className="emotion-label">😢 Sad</div>
               <div className="segmented-bar-container">
                 <div className="segmented-bar-fill fill-sad" style={{ width: `0%` }}></div>
               </div>
               <div style={{width: '35px', textAlign: 'right', fontWeight: 800, fontSize: '0.8rem'}}>0%</div>
             </div>

           </div>
        </div>

      </div>
    </div>
  );
}
