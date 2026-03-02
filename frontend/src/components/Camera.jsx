import React, { useRef, useState, useEffect } from 'react';
import { Camera as CameraIcon, Play } from 'lucide-react';

export default function Camera({ onCapture, isActive, setIsActive, data }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let stream = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setError('');
      } catch (err) {
        setError('Camera blocked. Please allow permissions.');
        setIsActive(false);
      }
    };

    if (isActive) {
      startCamera();
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isActive, setIsActive]);

  useEffect(() => {
    let interval;
    if (isActive) {
      interval = setInterval(() => {
        captureFrame();
      }, 3000); // 3 sec interval
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current && isActive) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video.videoWidth === 0) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Image = canvas.toDataURL('image/jpeg', 0.8);
      if (onCapture) {
        onCapture(base64Image);
      }
    }
  };

  const engaged = data ? data.engaged : 0;
  
  const alerts = [];
  if (data) {
    if (data.negative > 30) alerts.push("High confusion detected.");
    if (data.neutral > 50) alerts.push("Attention slipping in back rows.");
    if (data.engaged < 40) alerts.push("Engagement dropped below threshold.");
  } else if (!isActive) {
     alerts.push("System strictly offline.");
  } else {
     alerts.push("Waiting for stream data...");
  }

  return (
    <div className="retro-window">
      <div className="retro-window-header header-pink">
        <span>Video_Feed_Analyzer.exe</span>
        <div className="window-controls">
          <div className="win-close-btn" style={{backgroundColor: '#fff', color: '#000'}}>-</div>
          <div className="win-close-btn" style={{backgroundColor: '#fff', color: '#000'}}>+</div>
          <div className="win-close-btn">X</div>
        </div>
      </div>
      
      <div className="camera-layout-inner">
        {/* Top: Video Feed Area */}
        <div className="video-container">
          <video 
            ref={videoRef}
            autoPlay 
            playsInline 
            muted 
            style={{ display: isActive ? 'block' : 'none' }}
          />
          {!isActive && (
            <div style={{ position: 'absolute', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#2b2b2b' }}>
              <Play size={48} style={{ opacity: 0.2, marginBottom: '0.5rem' }} />
              <span style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '2px', opacity: 0.5 }}>VIDEO PAUSED</span>
            </div>
          )}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {!isActive ? (
            <button className="btn btn-green" onClick={() => setIsActive(true)}>
              <CameraIcon size={20} /> START FEED
            </button>
          ) : (
            <button className="btn btn-red" onClick={() => setIsActive(false)}>
               STOP FEED
            </button>
          )}
        </div>
        {error && <div style={{ color: 'var(--retro-red)', fontWeight: 800, textAlign: 'center' }}>{error}</div>}

        {/* Bottom: Analytics Sidebar (matches right side of wireframe layout) */}
        <div className="inner-box" style={{ marginTop: '0.5rem' }}>
          <div className="inner-box-title" style={{ borderBottom: '2.5px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
             Real-Time Analytics
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Left Col of Inner Box */}
            <div>
              <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 800, marginBottom: '0.5rem' }}>Engagement Percentage</h4>
              
              <div style={{ height: '24px', border: '2.5px solid var(--border-color)', borderRadius: '12px', padding: '2px', position: 'relative', overflow: 'hidden', backgroundColor: '#fff' }}>
                 <div style={{ width: `${engaged}%`, height: '100%', backgroundColor: 'var(--retro-blue)', transition: 'width 0.3s', borderRadius: '8px', borderRight: '2.5px solid var(--border-color)' }}></div>
              </div>
              <div style={{ textAlign: 'right', fontWeight: 800, marginTop: '0.5rem' }}>{engaged}%</div>
            </div>

            {/* Right Col of Inner Box */}
            <div>
              <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 800, marginBottom: '0.5rem' }}>Active Alerts List</h4>
              <ul className="alert-list">
                  {alerts.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </div>
          </div>
        </div>

      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
