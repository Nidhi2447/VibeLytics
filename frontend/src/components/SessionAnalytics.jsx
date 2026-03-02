import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, Tooltip } from 'recharts';
import { Clock, TrendingUp, TrendingDown, PieChart } from 'lucide-react';

export default function SessionAnalytics() {
  const [session, setSession] = useState('Session 1 - Intro to AI');

  // Hardcoded mock data based on wireframe requests
  const timeGraphData = [
    { time: 'T-0', engagement: 40 },
    { time: 'T-10', engagement: 60 },
    { time: 'T-20', engagement: 45 },
    { time: 'T-30', engagement: 85 },
    { time: 'T-40', engagement: 70 },
    { time: 'T-50', engagement: 95 },
    { time: 'T-60', engagement: 80 },
  ];

  const teachingMethodData = [
    { method: 'Lecture', score: 65 },
    { method: 'Discussion', score: 90 },
    { method: 'Group Work', score: 45 },
    { method: 'Quiz', score: 75 },
  ];

  return (
    <div className="retro-window">
      <div className="retro-window-header header-yellow">
        <span>Session_Analytics.exe</span>
        <div className="window-controls">
           <div className="win-close-btn" style={{backgroundColor: '#fff', color: '#000'}}>-</div>
           <div className="win-close-btn" style={{backgroundColor: '#fff', color: '#000'}}>+</div>
           <div className="win-close-btn">X</div>
        </div>
      </div>

      <div className="session-layout">
        <div className="session-header-select">
          <span>SELECT SESSION ARCHIVE: </span>
          <select className="retro-select" value={session} onChange={(e) => setSession(e.target.value)}>
            <option>Session 1 - Intro to AI</option>
            <option>Session 2 - Python Basics</option>
            <option>Session 3 - Machine Learning</option>
          </select>
        </div>

        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-box-title">Average Engagement</div>
            <div className="stat-box-value">
               72% <TrendingUp size={28} color="var(--retro-teal)" style={{strokeWidth: 3}} />
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-box-title">Peak Engagement</div>
            <div className="stat-box-value">
              89% <Clock size={28} color="var(--retro-blue)" style={{strokeWidth: 3}} />
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: '0.2rem', color: 'var(--border-color)' }}>SYS_TIME: 10:15 AM</div>
          </div>

          <div className="stat-box">
            <div className="stat-box-title">Lowest Engagement Moment</div>
            <div className="stat-box-value">
              45% <TrendingDown size={28} color="var(--retro-red)" style={{strokeWidth: 3}} />
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: '0.2rem', color: 'var(--border-color)' }}>SYS_TIME: 11:05 AM</div>
          </div>
        </div>

        <div className="graphs-grid">
          
          <div className="inner-box">
            <div className="inner-box-title"><PieChart size={16} /> Engagement Over Time Graph</div>
            <div className="graph-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeGraphData}>
                  <CartesianGrid strokeDasharray="2 4" vertical={false} />
                  <XAxis dataKey="time" axisLine={{stroke: 'var(--border-color)', strokeWidth: 2}} tickLine={false} tick={{dy: 10}} />
                  <YAxis domain={[0, 100]} axisLine={{stroke: 'var(--border-color)', strokeWidth: 2}} tickLine={false} width={30} />
                  <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} contentStyle={{border: '2.5px solid var(--border-color)', borderRadius: '4px', boxShadow: '2px 2px 0px var(--border-color)', fontWeight: '800', fontSize: '0.8rem'}} />
                  <Area type="monotone" dataKey="engagement" stroke="var(--border-color)" fill="var(--retro-teal)" strokeWidth={3.5} activeDot={{ r: 6, stroke: 'var(--border-color)', strokeWidth: 2, fill: '#fff' }} fillOpacity={1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="inner-box">
            <div className="inner-box-title"><Activity size={16} /> Teaching Method Comparison</div>
            <div className="graph-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teachingMethodData}>
                  <CartesianGrid strokeDasharray="2 4" vertical={false} />
                  <XAxis dataKey="method" axisLine={{stroke: 'var(--border-color)', strokeWidth: 2}} tickLine={false} tick={{dy: 10}} />
                  <YAxis domain={[0, 100]} axisLine={{stroke: 'var(--border-color)', strokeWidth: 2}} tickLine={false} width={30} />
                  <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} contentStyle={{border: '2.5px solid var(--border-color)', borderRadius: '4px', boxShadow: '2px 2px 0px var(--border-color)', fontWeight: '800', fontSize: '0.8rem'}} />
                  <Bar dataKey="score" fill="var(--retro-pink)" stroke="var(--border-color)" strokeWidth={2.5} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
