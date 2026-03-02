import React, { useState, useRef, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { Play, Square, TrendingUp, Smile, Meh, HelpCircle, Frown, AlertTriangle, Users, BookOpen, Camera, ChevronDown, Activity, User, Flag, Lightbulb } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function LiveFeed() {
  const { 
    isMonitoring, setIsMonitoring, handleStopMonitoring,
    sessionTime, activeStudents, currentData, alerts,
    graphData, cameraStream, cameraError, videoDevices, selectedDeviceId, setSelectedDeviceId
  } = useAppContext();

  const videoRef = useRef(null);
  const [subjectName, setSubjectName] = useState('Physics 101');
  const [activeTab, setActiveTab] = useState('grid'); // 'alerts' or 'grid'
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Bind the global camera stream to the local video element
  useEffect(() => {
    if (videoRef.current) {
      if (isMonitoring && cameraStream) {
        videoRef.current.srcObject = cameraStream;
      } else {
        videoRef.current.srcObject = null;
      }
    }
  }, [cameraStream, isMonitoring]);


  const pieData = [
    { name: 'Engaged', value: currentData.engagement },
    { name: 'Remaining', value: 100 - currentData.engagement }
  ];
  const COLORS = ['var(--primary)', 'var(--bg-app)'];

  // Format Timer
  const hrs = Math.floor(sessionTime / 3600);
  const mins = Math.floor((sessionTime % 3600) / 60);
  const secs = sessionTime % 60;
  const timeStr = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  // Generate 35 mock students for the grid
  const mockStudents = Array.from({ length: 35 }, (_, i) => {
    const status = isMonitoring ? (Math.random() > 0.8 ? 'confused' : Math.random() > 0.9 ? 'sad' : 'engaged') : 'offline';
    return { id: i, name: `Student ${i + 1}`, status };
  });

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Live Tracking Cockpit</h1>
          <p className="page-subtitle">Real-time engagement tracking and active student grid view.</p>
        </div>
      </div>

      <div className="live-feed-top" style={{ display: 'grid', gridTemplateColumns: '1.7fr 1.3fr', gap: '1.5rem', marginTop: 0 }}>
          
        {/* LEFT COLUMN: Camera, Pills, Graph */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', gridColumn: '1 / 2', gridRow: '1 / 2' }}>
          
          {/* Top Session Info Bar */}
          <div className="soft-card" style={{ padding: '0.75rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={16} className="text-primary" />
              <input 
                type="text" 
                value={subjectName} 
                onChange={(e) => setSubjectName(e.target.value)}
                style={{ border: 'none', background: 'transparent', fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)', width: '150px', outline: 'none' }}
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: isMonitoring ? 'var(--danger)' : 'var(--text-muted)' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isMonitoring ? 'var(--danger)' : 'var(--text-muted)', animation: isMonitoring ? 'pulseDot 1.5s infinite' : 'none' }}></div>
                  {timeStr}
               </div>

               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--text-main)', paddingLeft: '1.5rem', borderLeft: '1px solid #e2e8f0' }}>
                  <Users size={16} className="text-primary" />
                  {isMonitoring ? `${activeStudents} / 35 Active` : '0 / 35 Active'}
               </div>
            </div>
          </div>

          {/* Main Video Box & Doughnut Overlay */}
          <div className="soft-card" style={{ padding: 0, overflow: 'hidden', position: 'relative', aspectRatio: '16/9', backgroundColor: '#0f172a' }}>
               <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', right: '1.5rem', zIndex: 10, display: 'flex', justifyContent: 'space-between' }}>
                 <div>
                   <span style={{ backgroundColor: isMonitoring ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.1)', color: isMonitoring ? 'var(--danger)' : '#fff', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-pill)', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', border: `1px solid ${isMonitoring ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.2)'}` }}>
                     <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isMonitoring ? 'var(--danger)' : '#fff', animation: isMonitoring ? 'pulseDot 1.5s infinite' : 'none' }}></div> {isMonitoring ? 'LIVE' : 'OFFLINE'}
                   </span>
                 </div>
                 
                 <div style={{ display: 'flex', gap: '0.75rem' }}>
                   {isMonitoring && videoDevices && videoDevices.length > 1 && (
                     <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                       <Camera size={14} style={{ position: 'absolute', left: '0.75rem', color: '#fff', pointerEvents: 'none', zIndex: 12 }} />
                       <select 
                         value={selectedDeviceId} 
                         onChange={(e) => setSelectedDeviceId(e.target.value)}
                         style={{ appearance: 'none', backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '0.4rem 2rem 0.4rem 2rem', borderRadius: 'var(--radius-pill)', cursor: 'pointer', backdropFilter: 'blur(4px)', fontWeight: 600, fontSize: '0.75rem', outline: 'none' }}
                       >
                         {videoDevices.map((device, idx) => (
                           <option key={device.deviceId} value={device.deviceId} style={{ color: '#000' }}>
                             {device.label || `Camera ${idx + 1}`}
                           </option>
                         ))}
                       </select>
                       <ChevronDown size={14} style={{ position: 'absolute', right: '0.75rem', color: '#fff', pointerEvents: 'none', zIndex: 12 }} />
                     </div>
                   )}

                   {isMonitoring && (
                     <button onClick={handleStopMonitoring} style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.3)', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-pill)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', backdropFilter: 'blur(4px)', fontWeight: 700, fontSize: '0.75rem', transition: 'all 0.2s', zIndex: 11 }}>
                        <Square size={12} fill="currentColor" /> End Session
                     </button>
                   )}
                 </div>
               </div>

               {/* Central Play Button */}
               {!isMonitoring && (
                 <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem', letterSpacing: '2px', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>START MONITORING</div>
                    <button onClick={() => setIsMonitoring(true)} style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: 'rgba(56, 189, 248, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none', boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)' }}>
                       <Play size={32} fill="#fff" color="#fff" style={{ marginLeft: '4px' }} />
                    </button>
                 </div>
               )}

               {/* Live Doughnut Overlay */}
               {isMonitoring && (
                 <div style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem', zIndex: 10, width: '120px', height: '120px', backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ position: 'relative', width: '90px', height: '90px' }}>
                       <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                         <PieChart>
                           <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={40} startAngle={90} endAngle={-270} dataKey="value" stroke="none" cornerRadius={10} animationDuration={1000}>
                             {pieData.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--success)' : 'rgba(255,255,255,0.1)'} />
                             ))}
                           </Pie>
                         </PieChart>
                       </ResponsiveContainer>
                       <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', color: '#fff', fontSize: '1.1rem', fontWeight: 800 }}>
                          {currentData.engagement}%
                       </div>
                    </div>
                 </div>
               )}
               
               <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0) 30%, rgba(15,23,42,0) 70%, rgba(15,23,42,0.7) 100%)', zIndex: 5, pointerEvents: 'none' }}></div>
               
               <video 
                 ref={videoRef} autoPlay playsInline muted 
                 style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isMonitoring ? 1 : 0.3, transition: 'opacity 0.5s', transform: 'scaleX(-1)' }}
               />
               
               {!isMonitoring && (
                 <img src="https://images.unsplash.com/photo-1540039155732-678122d1b913?auto=format&fit=crop&q=80&w=1280" alt="Concert Crowd placeholder" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3, zIndex: 1 }} />
               )}
          </div>

          {/* Emotion Pill Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
             <div className="soft-card" style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: isMonitoring && currentData.happy > 60 ? '2px solid var(--success)' : '2px solid transparent' }}>
               <div style={{ backgroundColor: '#dcfce7', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Smile size={18} className="text-success" /></div>
               <div>
                 <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }}>HAPPY</div>
                 <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--success)' }}>{isMonitoring ? currentData.happy : '--'}%</div>
               </div>
             </div>

             <div className="soft-card" style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
               <div style={{ backgroundColor: 'var(--primary-light)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Meh size={18} className="text-primary" /></div>
               <div>
                 <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }}>CALM</div>
                 <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>{isMonitoring ? currentData.calm : '--'}%</div>
               </div>
             </div>

             <div className="soft-card" style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: isMonitoring && currentData.confused > 15 ? '2px solid var(--warning)' : '2px solid transparent' }}>
               <div style={{ backgroundColor: '#fef9c3', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><HelpCircle size={18} className="text-warning" /></div>
               <div>
                 <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }}>CONFUSED</div>
                 <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--warning)' }}>{isMonitoring ? currentData.confused : '--'}%</div>
               </div>
             </div>

             <div className="soft-card" style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
               <div style={{ backgroundColor: 'var(--danger-light)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Frown size={18} className="text-danger" /></div>
               <div>
                 <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }}>SAD</div>
                 <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--danger)' }}>{isMonitoring ? currentData.sad : '--'}%</div>
               </div>
             </div>
          </div>

          {/* Live Engagement Graph (Moved from Overview) */}
          <div className="soft-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', height: '140px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
               <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <Activity size={14} className="text-primary" /> Live Chart (Last 10 Min)
               </div>
            </div>
            <div style={{ flexGrow: 1, marginLeft: '-20px', minHeight: 0 }}>
              {isMonitoring ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <AreaChart data={graphData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={3} fill="url(#colorValue)" isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Awaiting camera stream...</div>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Tabs, Lists, Insights */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, gridColumn: '2 / 3', gridRow: '1 / 2' }}>
          
          <div className="soft-card" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0, padding: 0 }}>
             
             {/* Tab Headers */}
             <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9', padding: '1rem 1.5rem 0' }}>
               <button 
                 onClick={() => setActiveTab('grid')} 
                 style={{ padding: '0.5rem 1rem', border: 'none', background: 'transparent', cursor: 'pointer', borderBottom: activeTab === 'grid' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'grid' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 800, fontSize: '0.9rem', flexGrow: 1, transition: 'color 0.2s' }}
               >
                 Student Grid
               </button>
               <button 
                 onClick={() => setActiveTab('alerts')} 
                 style={{ padding: '0.5rem 1rem', border: 'none', background: 'transparent', cursor: 'pointer', borderBottom: activeTab === 'alerts' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'alerts' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 800, fontSize: '0.9rem', flexGrow: 1, transition: 'color 0.2s' }}
               >
                 Recent Alerts
               </button>
             </div>

             {/* Tab Content */}
             <div style={{ padding: '1rem 1.5rem', flexGrow: 1, overflowY: 'auto', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
               
               {activeTab === 'alerts' && (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {alerts.length === 0 && (
                      <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem 0' }}>No recent alerts.</div>
                    )}
                    {alerts.slice(0, 5).map((alert) => {
                      const LocalIcon = alert.icon;
                      const bgC = alert.type === 'danger' ? 'var(--danger-light)' : alert.type === 'warning' ? '#fef9c3' : alert.type === 'success' ? '#dcfce7' : 'var(--bg-app)';
                      const fgC = alert.type === 'danger' ? 'var(--danger)' : alert.type === 'warning' ? 'var(--warning)' : alert.type === 'success' ? 'var(--success)' : 'var(--text-muted)';
                      
                      return (
                        <div key={alert.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '12px', flexShrink: 0 }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: bgC, color: fgC, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <LocalIcon size={16} />
                          </div>
                          <div style={{ flexGrow: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{alert.title}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{alert.desc}</div>
                          </div>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, flexShrink: 0 }}>{alert.time}</span>
                        </div>
                      );
                    })}
                 </div>
               )}

               {activeTab === 'grid' && (
                 <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    {/* The Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem', flexGrow: 1, alignContent: 'start' }}>
                      {mockStudents.map((stu) => {
                        const statusColor = stu.status === 'engaged' ? 'var(--success)' : stu.status === 'confused' ? 'var(--warning)' : stu.status === 'sad' ? 'var(--danger)' : '#cbd5e1';
                        const dotColor = stu.status === 'offline' ? 'transparent' : statusColor;
                        
                        return (
                          <div 
                            key={stu.id} 
                            onClick={() => setSelectedStudent(stu)}
                            style={{ aspectRatio: '1/1', backgroundColor: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', border: selectedStudent?.id === stu.id ? `2px solid var(--primary)` : '2px solid transparent', transition: 'border-color 0.2s', boxShadow: 'var(--shadow-sm)' }}
                          >
                             <User size={20} color={stu.status === 'offline' ? '#94a3b8' : 'var(--text-main)'} />
                             {/* Status Dot */}
                             <div style={{ position: 'absolute', bottom: '4px', right: '4px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: dotColor, border: '2px solid #fff' }}></div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Drawer (Inline for selected student) */}
                    {selectedStudent && (
                      <div style={{ marginTop: '1rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', animation: 'slideIn 0.3s ease-out', flexShrink: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>{selectedStudent.name}</h4>
                          <button onClick={() => setSelectedStudent(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}><Square size={14} /></button>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                          Currently: <span style={{ fontWeight: 700, color: selectedStudent.status === 'engaged' ? 'var(--success)' : selectedStudent.status === 'confused' ? 'var(--warning)' : 'var(--danger)', textTransform: 'capitalize' }}>{selectedStudent.status}</span>
                        </p>
                        <button style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                           <Flag size={14} /> Flag Student
                        </button>
                      </div>
                    )}
                 </div>
               )}

             </div>

             {/* Bottom AI Insight Chip (Live Feed specific) */}
             <div style={{ margin: '1rem', padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ color: '#3b82f6', marginTop: '2px' }}><Lightbulb size={16} /></div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.75rem', color: '#1e40af', marginBottom: '0.25rem', letterSpacing: '0.5px' }}>LIVE INSIGHT</div>
                  <div style={{ fontSize: '0.85rem', color: '#1e3a8a', lineHeight: 1.4, fontWeight: 500 }}>
                    {isMonitoring ? "17% confused — consider slowing down or asking a quick question." : "Insight engine ready."}
                  </div>
                </div>
             </div>
          </div>
        </div>

      </div>
    </>
  );
}
