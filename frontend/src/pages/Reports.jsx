import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Calendar, Download, FileText, CheckCircle2, ChevronRight, X, Sparkles, RefreshCcw, Activity, AlertTriangle, PieChart as PieChartIcon, AlignLeft, Smile, Meh, HelpCircle, Frown } from 'lucide-react';

// Mock data for the 7-day trend
const weeklyData = [
  { day: 'Mon', engagement: 65, confusion: 30 },
  { day: 'Tue', engagement: 72, confusion: 25 },
  { day: 'Wed', engagement: 68, confusion: 28 },
  { day: 'Thu', engagement: 85, confusion: 15 },
  { day: 'Fri', engagement: 90, confusion: 10 },
  { day: 'Sat', engagement: 88, confusion: 12 },
  { day: 'Sun', engagement: 92, confusion: 5 },
];

const subjectData = [
  { subject: 'Physics 101', engagement: 88 },
  { subject: 'Intro to Bio', engagement: 79 },
  { subject: 'Chemistry Lab', engagement: 75 },
  { subject: 'Calculus II', engagement: 62 },
];

const pastSessions = [
  { id: 1, date: 'Oct 24', subject: 'Physics 101', avgVibe: 88, peak: 'Happy', duration: '45 min', timeline: [{t:0, e:80},{t:10, e:85},{t:20, e:90},{t:30, e:88},{t:40, e:86}], moments: [] },
  { id: 2, date: 'Oct 23', subject: 'Calculus II', avgVibe: 62, peak: 'Confused', duration: '1h 15m', timeline: [{t:0, e:70},{t:20, e:65},{t:45, e:50},{t:60, e:55},{t:75, e:60}], moments: ['10:45 AM - 35% confused spike detected', '11:10 AM - 22% confused spike detected'] },
  { id: 3, date: 'Oct 22', subject: 'Chemistry Lab', avgVibe: 75, peak: 'Calm', duration: '2h 00m', timeline: [{t:0, e:70},{t:30, e:75},{t:60, e:80},{t:90, e:72},{t:120, e:75}], moments: ['02:30 PM - Minor distraction noticed'] },
  { id: 4, date: 'Oct 21', subject: 'Physics 101', avgVibe: 85, peak: 'Happy', duration: '50 min', timeline: [{t:0, e:80},{t:20, e:82},{t:40, e:88},{t:50, e:85}], moments: [] },
];

export default function Reports() {
  const [toastVisible, setToastVisible] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  const handleExport = () => {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">The Review Room</h1>
          <p className="page-subtitle">Deep analytics, subject comparison, and session drill-downs.</p>
        </div>
        
        {/* Date / Export Actions */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="toggle-pill" style={{ opacity: 0.9, backgroundColor: '#fff', border: '1px solid #e2e8f0' }}>
            <div className="toggle-option" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', padding: '0.25rem 1rem' }}>
              <Calendar size={16} /> Last 7 Days
            </div>
          </div>
          
          <button 
            onClick={handleExport}
            className="btn-solid" 
            style={{ borderRadius: 'var(--radius-pill)', padding: '0.5rem 1.5rem', fontSize: '0.85rem' }}
          >
            <Download size={16} style={{ marginRight: '0.5rem' }} /> Export Portfolio
          </button>
        </div>
      </div>

      {/* SECTION A: Summary Bar */}
      <div className="dash-top-cards" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1.5rem', marginTop: 0 }}>
        <div className="soft-card" style={{ padding: '1.5rem' }}>
          <div className="card-title" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOTAL SESSIONS</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.5rem' }}>42</div>
        </div>
        <div className="soft-card" style={{ padding: '1.5rem' }}>
          <div className="card-title" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AVG ENGAGEMENT</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.5rem' }}>81%</div>
        </div>
        <div className="soft-card" style={{ padding: '1.5rem' }}>
          <div className="card-title" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>BEST SUBJECT</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.5rem', lineHeight: 1.2 }}>Physics 101</div>
        </div>
        <div className="soft-card" style={{ padding: '1.5rem', border: '2px solid var(--warning)' }}>
          <div className="card-title" style={{ fontSize: '0.75rem', color: 'var(--warning)' }}>MOST CONFUSED TOPIC</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--warning)', marginTop: '0.5rem', lineHeight: 1.2 }}>Calculus II</div>
        </div>
      </div>

      {/* SECTION B: Two charts side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Left: 7-Day Emotion Trends (Dual Line/Area Chart) */}
        <div className="soft-card" style={{ padding: '1.5rem', minHeight: '350px', display: 'flex', flexDirection: 'column' }}>
           <div className="card-title" style={{ textTransform: 'none', fontSize: '1.1rem', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              7-Day Emotion Trends
           </div>
           <div style={{ flexGrow: 1, minHeight: 0, marginLeft: '-20px' }}>
             <ResponsiveContainer width="100%" height="100%" minHeight={1} minWidth={1}>
               <AreaChart data={weeklyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                 <defs>
                    <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="var(--warning)" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="var(--warning)" stopOpacity={0}/>
                    </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                 <XAxis dataKey="day" axisLine={false} tickLine={false} dy={10} tick={{ fontSize: 12, fill: 'var(--text-muted)', fontWeight: 600 }} />
                 <YAxis axisLine={false} tickLine={false} dx={-10} tick={{ fontSize: 12, fill: 'var(--text-muted)', fontWeight: 600 }} />
                 <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-md)', fontWeight: 600 }} />
                 <Legend verticalAlign="top" height={36} iconType="circle" />
                 <Area type="monotone" name="Engagement %" dataKey="engagement" stroke="var(--primary)" strokeWidth={3} fill="url(#engGrad)" dot={false} activeDot={{ r: 6 }} isAnimationActive={false} />
                 <Area type="monotone" name="Confusion %" dataKey="confusion" stroke="var(--warning)" strokeWidth={3} fill="url(#confGrad)" dot={false} activeDot={{ r: 6 }} isAnimationActive={false} />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Right: Engagement by Subject (Horizontal Bar Chart) */}
        <div className="soft-card" style={{ padding: '1.5rem', minHeight: '350px', display: 'flex', flexDirection: 'column' }}>
           <div className="card-title" style={{ textTransform: 'none', fontSize: '1.1rem', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              Engagement by Subject
           </div>
           <div style={{ flexGrow: 1, minHeight: 0, marginLeft: '-40px' }}>
             <ResponsiveContainer width="100%" height="100%" minHeight={1} minWidth={1}>
               <BarChart data={subjectData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                 <XAxis type="number" hide />
                 <YAxis dataKey="subject" type="category" axisLine={false} tickLine={false} width={100} tick={{ fontSize: 12, fill: 'var(--text-main)', fontWeight: 700 }} />
                 <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-sm)', fontWeight: 600 }} />
                 <Bar dataKey="engagement" name="Avg Engagement %" fill="var(--success)" radius={[0, 8, 8, 0]} barSize={24} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

      </div>

      {/* SECTION C & MAIN BODY: Sessions Table + Detail Drawer toggle */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
         
         <div className="soft-card" style={{ flexGrow: 1, padding: 0, display: 'flex', flexDirection: 'column', transition: 'width 0.3s' }}>
           <div className="card-title" style={{ textTransform: 'none', fontSize: '1.1rem', padding: '1.5rem 1.5rem 1rem' }}>Past Sessions Detail Log</div>
           
           <div style={{ width: '100%', overflowX: 'auto', flexGrow: 1 }}>
             <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
               <thead>
                 <tr style={{ backgroundColor: '#f8fafc', color: 'var(--text-muted)', borderBottom: '1px solid #e2e8f0' }}>
                   <th style={{ padding: '0.75rem 1.5rem', fontWeight: 700 }}>Date</th>
                   <th style={{ padding: '0.75rem 1.5rem', fontWeight: 700 }}>Subject</th>
                   <th style={{ padding: '0.75rem 1.5rem', fontWeight: 700 }}>Avg Vibe</th>
                   <th style={{ padding: '0.75rem 1.5rem', fontWeight: 700 }}>Duration</th>
                   <th style={{ padding: '0.75rem 1.5rem' }}></th>
                 </tr>
               </thead>
               <tbody>
                 {pastSessions.map((session) => (
                   <tr 
                     key={session.id} 
                     onClick={() => setSelectedSession(session)}
                     style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', backgroundColor: selectedSession?.id === session.id ? '#f1f5f9' : 'transparent', transition: 'background-color 0.2s' }}
                     onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                     onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedSession?.id === session.id ? '#f1f5f9' : 'transparent'}
                   >
                     <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>{session.date}</td>
                     <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>{session.subject}</td>
                     <td style={{ padding: '1.25rem 1.5rem', color: session.avgVibe > 80 ? 'var(--success)' : session.avgVibe > 70 ? 'var(--primary)' : 'var(--warning)', fontWeight: 800 }}>
                       {session.avgVibe}%
                     </td>
                     <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)' }}>{session.duration}</td>
                     <td style={{ padding: '1.25rem 1.5rem', color: 'var(--primary)' }}><ChevronRight size={18} /></td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </div>

         {/* Right Drawer (Slide in) */}
         {selectedSession && (
           <div className="soft-card" style={{ width: '400px', flexShrink: 0, animation: 'slideInRight 0.3s ease-out', padding: 0, display: 'flex', flexDirection: 'column' }}>
             
             <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', borderTopLeftRadius: '24px', borderTopRightRadius: '24px' }}>
                <div>
                   <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>{selectedSession.subject}</h3>
                   <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{selectedSession.date} • {selectedSession.duration}</span>
                </div>
                <button onClick={() => setSelectedSession(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
             </div>

             <div style={{ padding: '1.5rem', flexGrow: 1, overflowY: 'auto' }}>
                
                {/* AI Summary Block */}
                <div style={{ backgroundColor: '#eff6ff', borderRadius: '12px', padding: '1rem', border: '1px solid #bfdbfe', marginBottom: '1.5rem' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e40af', fontWeight: 800, fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                      <Sparkles size={14} fill="#3b82f6" /> AI SESSION SUMMARY
                   </div>
                   <p style={{ fontSize: '0.85rem', color: '#1e3a8a', lineHeight: 1.5, fontWeight: 500 }}>
                     Session began strong but experienced a significant engagement drop around the midpoint. Suggest reviewing the materials presented between minute 30 and 45. Overall positive recovery towards the end.
                   </p>
                </div>

                {/* Mini Graph */}
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Activity size={16} className="text-primary" /> Engagement Timeline
                </h4>
                <div style={{ height: '120px', width: '100%', marginBottom: '1.5rem', marginLeft: '-15px' }}>
                  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                     <LineChart data={selectedSession.timeline}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="t" hide />
                       <YAxis domain={['auto', 'auto']} hide />
                       <Tooltip labelFormatter={() => 'Time'} formatter={(val) => [`${val}%`, 'Engagement']} contentStyle={{ borderRadius: '8px', fontSize: '0.8rem' }} />
                       <Line type="monotone" dataKey="e" stroke="var(--primary)" strokeWidth={3} dot={{r: 3, strokeWidth: 2}} />
                     </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Emotion Breakdown */}
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <PieChartIcon size={16} className="text-warning" /> Emotion Breakdown
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
                   <div style={{ backgroundColor: '#dcfce7', color: 'var(--success)', padding: '0.5rem 0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.85rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Smile size={14} /> Happy</span>
                      <span>60%</span>
                   </div>
                   <div style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '0.5rem 0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.85rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Meh size={14} /> Calm</span>
                      <span>20%</span>
                   </div>
                   <div style={{ backgroundColor: '#fef9c3', color: 'var(--warning)', padding: '0.5rem 0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.85rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><HelpCircle size={14} /> Confused</span>
                      <span>15%</span>
                   </div>
                   <div style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', padding: '0.5rem 0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.85rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Frown size={14} /> Sad</span>
                      <span>5%</span>
                   </div>
                </div>

                {/* Confusion Moments */}
                {selectedSession.moments.length > 0 && (
                  <>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertTriangle size={16} className="text-danger" /> Disengagement Markers
                    </h4>
                    <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {selectedSession.moments.map((mom, i) => (
                        <li key={i} style={{ fontSize: '0.8rem', color: 'var(--text-body)', fontWeight: 500, display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                          <span style={{ color: 'var(--danger)', marginTop: '2px' }}>•</span> {mom}
                        </li>
                      ))}
                    </ul>
                  </>
                )}

             </div>
             
             <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px' }}>
                <button 
                  onClick={handleExport}
                  style={{ width: '100%', padding: '0.75rem', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '12px', color: 'var(--text-main)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: 'var(--shadow-sm)' }}
                >
                   <FileText size={16} /> Export Session Report
                </button>
             </div>

           </div>
         )}
      </div>

      {/* SECTION D: Weekly AI Bedrock Summary */}
      <div className="soft-card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', background: 'linear-gradient(to right, #eff6ff, #ffffff)', border: '1px solid #bfdbfe', marginBottom: '2rem' }}>
         <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlignLeft size={36} />
         </div>
         <div style={{ flexGrow: 1 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e40af', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <Sparkles size={18} fill="#2563eb" /> AI Weekly Master Summary
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#1e3a8a', lineHeight: 1.6, fontWeight: 500, maxWidth: '900px' }}>
               This week your best class was Physics 101 on Thursday with 88% engagement. Calculus II on Wednesday showed repeated confusion spikes between 10:45–11:05 AM, suggesting the derivative section needs revisiting. Overall engagement improved 12% versus last week, largely driven by better interactivity in morning sessions.
            </p>
         </div>
         <button style={{ backgroundColor: '#fff', border: '1px solid #bfdbfe', color: '#2563eb', padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s', alignSelf: 'flex-start', boxShadow: 'var(--shadow-sm)' }}>
            <RefreshCcw size={16} /> Regenerate
         </button>
      </div>

      {/* Mock Toast Notification */}
      {toastVisible && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', backgroundColor: '#10b981', color: '#fff', padding: '1rem 1.5rem', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600, animation: 'slideUp 0.3s ease-out', zIndex: 1000 }}>
          <CheckCircle2 size={20} />
          Report exported successfully.
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
