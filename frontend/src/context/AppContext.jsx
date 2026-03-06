import React, { createContext, useContext, useState, useEffect } from 'react';
import { HelpCircle, WifiOff, TrendingDown, Smile, Users, AlertTriangle, CheckCircle2 } from 'lucide-react';

const AppContext = createContext();

export function AppProvider({ children }) {
  // -- GLOBAL STATE --
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [activeStudents, setActiveStudents] = useState(32);
  const [activeClass, setActiveClass] = useState('Section 10-B');
  const [todaySessions, setTodaySessions] = useState(0);
  
  // Camera State
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const streamRef = React.useRef(null);
  
  const getDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const vids = devices.filter(d => d.kind === 'videoinput');
      setVideoDevices(vids);
    } catch(err) {}
  };

  useEffect(() => {
    getDevices();
  }, []);
  
  // Real-time Emotion Data
  const [currentData, setCurrentData] = useState({
    happy: 62,
    calm: 20,
    confused: 12,
    sad: 6,
    engagement: 82 // happy + calm
  });

  // Bedrock AI Suggestion
  const [aiSuggestion, setAiSuggestion] = useState("✅ Class vibe is steady and balanced. Keep up the good work!");

  // Historical Area Chart Data
  const [graphData, setGraphData] = useState([
    { time: '09:00', value: 80 }
  ]);

  // Global Notification Alerts
  const [alerts, setAlerts] = useState([]);

  // Session Summary Modal State
  const [showSummary, setShowSummary] = useState(false);
  const [sessionStats, setSessionStats] = useState(null);

  // Tracking arrays for Averages
  const [engagementHistory, setEngagementHistory] = useState([]);

  // Hardware Camera Loop wrapper tied to isMonitoring
  useEffect(() => {
    if (isMonitoring) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      const constraints = {
        video: selectedDeviceId ? { deviceId: { exact: selectedDeviceId }, width: { ideal: 1280 }, height: { ideal: 720 } } : { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
      };

      navigator.mediaDevices.getUserMedia(constraints)
      .then(stream => {
        streamRef.current = stream;
        setCameraStream(stream);
        setCameraError('');
        getDevices();
      })
      .catch(err => {
        setCameraError('Please allow camera access to start monitoring.');
        setIsMonitoring(false);
      });
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        setCameraStream(null);
      }
    }
  }, [isMonitoring, selectedDeviceId]);

  const switchCamera = () => {
    if (videoDevices.length > 1) {
      const currentIndex = videoDevices.findIndex(d => d.deviceId === selectedDeviceId);
      const nextIndex = (currentIndex + 1) % videoDevices.length;
      setSelectedDeviceId(videoDevices[nextIndex].deviceId);
    }
  };

  // Timer Tick (Every 1 Second)
  useEffect(() => {
    let timer;
    if (isMonitoring) {
      timer = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isMonitoring]);

  // Main Simulation Loop (Every 8 Seconds)
  useEffect(() => {
    let simLoop;
    if (isMonitoring) {
      simLoop = setInterval(() => {
        // 1. Generate realistic emotion ranges
        let h = Math.floor(Math.random() * (70 - 55 + 1)) + 55; // Happy: 55-70%
        let c = Math.floor(Math.random() * (25 - 18 + 1)) + 18; // Calm: 18-25%
        let conf = Math.floor(Math.random() * (18 - 8 + 1)) + 8; // Confused: 8-18%
        
        // Ensure total is 100%, Dump remainder into Sad
        let s = 100 - (h + c + conf);
        if (s < 0) { s = 0; conf = 100 - (h + c); } // Failsafe
        
        const eng = h + c;
        const prevEng = currentData.engagement;

        setCurrentData({ happy: h, calm: c, confused: conf, sad: s, engagement: eng });
        
        // Track History for Averages
        setEngagementHistory(prev => [...prev, eng]);

        // 2. Generate Graph Point
        setGraphData(prev => {
           const newData = [...prev];
           if (newData.length > 20) newData.shift(); // keep last 20 ticks
           
           // Mock a moving clock based on ticks for the graph X axis
           const now = new Date();
           const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
           
           newData.push({ time: timeStr, value: eng });
           return newData;
        });

        // 3. SMART ALERT SYSTEM Threshold Evaluation
        let newAlert = null;
        const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (eng < 65 && prevEng >= 65) {
          // Low Engagement
          newAlert = { id: Date.now(), type: 'danger', icon: TrendingDown, title: 'Low Engagement Alert', desc: `Class engagement dropped below 65% — consider a quick activity.`, time: nowStr, read: false };
        } else if (conf > 15) {
          // Confusion Spike
          newAlert = { id: Date.now(), type: 'warning', icon: HelpCircle, title: 'Confusion Spike', desc: `Confusion spike detected — 15%+ students appear confused.`, time: nowStr, read: false };
        } else if (eng >= 75 && prevEng < 65) {
          // Recovery
          newAlert = { id: Date.now(), type: 'success', icon: CheckCircle2, title: 'Engagement Recovery', desc: `Great! Class engagement recovered to 75%.`, time: nowStr, read: false };
        }

        // Push Alert
        if (newAlert) {
           setAlerts(prev => [newAlert, ...prev]);
        }

        // 4. Update AWS BEDROCK AI SUGGESTION
        if (conf > 15) {
          setAiSuggestion("💡 High confusion detected. Try a quick 2-minute recap or ask students to share doubts.");
        } else if (eng < 65) {
          setAiSuggestion("💡 Engagement is dropping. Consider a poll, quiz, or change of activity to re-energize the class.");
        } else if (s > 7) {
          setAiSuggestion("💡 Some students seem disengaged. A short break or interactive activity may help.");
        } else if (h > 65) {
          setAiSuggestion("✅ Class vibe is steady and balanced. Keep up the good work!");
        }

      }, 8000); // 8 second tick rate
    }

    return () => clearInterval(simLoop);
  }, [isMonitoring, currentData.engagement]);

  // Stop Monitoring Logic (Triggers Session Summary)
  const handleStopMonitoring = () => {
    setIsMonitoring(false);
    
    // Calculate Stats
    const totalEng = engagementHistory.reduce((sum, val) => sum + val, 0);
    const avg = engagementHistory.length > 0 ? Math.round(totalEng / engagementHistory.length) : 0;
    const peak = engagementHistory.length > 0 ? Math.max(...engagementHistory) : 0;
    const low = engagementHistory.length > 0 ? Math.min(...engagementHistory) : 0;
    
    // Format duration
    const hrs = Math.floor(sessionTime / 3600);
    const mins = Math.floor((sessionTime % 3600) / 60);
    const secs = sessionTime % 60;
    const timeStr = `${hrs > 0 ? hrs + 'h ' : ''}${mins > 0 ? mins + 'm ' : ''}${secs}s`;

    setSessionStats({
      duration: timeStr,
      avgEngagement: avg,
      peakEngagement: peak,
      lowestEngagement: low,
      dominantEmotion: 'Happy / Engaged'
    });
    
    setShowSummary(true);
  };

  const markAllRead = () => {
    setAlerts(alerts.map(n => ({ ...n, read: true })));
  };

  const closeSummary = () => {
    setShowSummary(false);
    setSessionStats(null);
    setSessionTime(0);
    setEngagementHistory([]);
    // Optionally reset arrays here if desired for a fresh start next run
  };

  return (
    <AppContext.Provider value={{
    isMonitoring, setIsMonitoring, handleStopMonitoring,
      sessionTime, activeStudents, activeClass, setActiveClass,
      currentData, aiSuggestion, graphData,
      alerts, markAllRead,
      showSummary, sessionStats, closeSummary,
      cameraStream, cameraError,
      videoDevices, selectedDeviceId, setSelectedDeviceId, switchCamera,
      todaySessions, setTodaySessions
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
