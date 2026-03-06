import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { Play, Square, Smile, Meh, HelpCircle, Frown, AlertTriangle, Users, BookOpen, Camera, ChevronDown, Activity, User, Flag, Lightbulb, CheckCircle2, Eye, FileText, PlayCircle } from 'lucide-react';
import { api } from '../api'
import socket from '../socket'
import AlertNotification from '../components/AlertNotification'

const TEACHER_ID = 'teacher-001'

export default function LiveFeed() {
  const location = useLocation()
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const intervalRef = useRef(null)
  const insightIntervalRef = useRef(null)
  const timerRef = useRef(null)

  const [sessionId, setSessionId] = useState(null)
  const [isLive, setIsLive] = useState(false)
  const [emotions, setEmotions] = useState({ happy: 0, calm: 0, confused: 0, sad: 0 })
  const [engagementScore, setEngagementScore] = useState(0)
  const [activeStudents, setActiveStudents] = useState(0)
  const [chartData, setChartData] = useState([])
  const [liveInsight, setLiveInsight] = useState('Insight engine ready.')
  const [alerts, setAlerts] = useState([])
  const [activeAlerts, setActiveAlerts] = useState([]) // For popup notifications
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [subject, setSubject] = useState(location?.state?.subject || '')
  const [subjectError, setSubjectError] = useState(false)
  const [sessionDuration, setSessionDuration] = useState(0)
  const durationRef = useRef(0)
  const emotionsRef = useRef({ happy: 0, calm: 0, confused: 0, sad: 0 })
  const engRef = useRef(0)
  // Accumulate every sample so we can compute a true session-wide average
  const engSamplesRef = useRef([])
  const emotionSamplesRef = useRef([])

  const [activeTab, setActiveTab] = useState('grid')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [videoDevices, setVideoDevices] = useState([])
  const [selectedDeviceId, setSelectedDeviceId] = useState('')
  const [cameraDropdownOpen, setCameraDropdownOpen] = useState(false)
  const cameraDropdownRef = useRef(null)

  // Close camera dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (cameraDropdownRef.current && !cameraDropdownRef.current.contains(e.target)) {
        setCameraDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Session saved modal state (Problem 7)
  const [showSavedModal, setShowSavedModal] = useState(false)
  const [savedStats, setSavedStats] = useState(null)
  
  // Confirmation modal for short sessions
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingSessionData, setPendingSessionData] = useState(null)

  // Keep emotions ref in sync for endSession
  useEffect(() => { emotionsRef.current = emotions }, [emotions])
  useEffect(() => { engRef.current = engagementScore }, [engagementScore])

  // Camera enumeration
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        stream.getTracks().forEach(t => t.stop())
        return navigator.mediaDevices.enumerateDevices()
      })
      .then(devices => {
        const videoIn = devices.filter(d => d.kind === 'videoinput')
        setVideoDevices(videoIn)
        if (videoIn.length > 0 && !selectedDeviceId) setSelectedDeviceId(videoIn[0].deviceId)
      })
      .catch(err => console.error('Could not access cameras:', err))
  }, [])

  // WebSocket
  useEffect(() => {
    socket.emit('join_room', TEACHER_ID)
    socket.on('emotion_update', (data) => {
      setEmotions(data.emotions)
      setEngagementScore(data.engagementScore)
      setActiveStudents(data.activeStudents)
      setChartData(prev => [...prev.slice(-20), {
        time: new Date().toLocaleTimeString(), value: data.engagementScore
      }])
      // Accumulate samples for session-wide averages
      if (data.engagementScore > 0) {
        engSamplesRef.current.push(data.engagementScore)
      }
      if (data.emotions) {
        emotionSamplesRef.current.push(data.emotions)
      }
    })
    socket.on('alert_triggered', (alert) => {
      setAlerts(prev => [alert, ...prev].slice(0, 5))
      // Add to active alerts for popup notification
      setActiveAlerts(prev => [...prev, {
        ...alert,
        id: alert.alertId || `alert-${Date.now()}`,
        title: alert.message,
        type: alert.alertType
      }])
      // Play sound if enabled
      if (soundEnabled) {
        playAlertSound()
      }
    })
    return () => { socket.off('emotion_update'); socket.off('alert_triggered') }
  }, [])

  // Cleanup: Stop camera when navigating away from page
  useEffect(() => {
    return () => {
      // Stop all intervals
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (insightIntervalRef.current) clearInterval(insightIntervalRef.current)
      if (timerRef.current) clearInterval(timerRef.current)
      
      // Stop camera stream
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => {
          track.stop()
          console.log('Camera stopped on navigation')
        })
        videoRef.current.srcObject = null
      }
    }
  }, [])

  const sessionIdRef = useRef(null)

  const startSession = async () => {
    // Problem 1: Validate subject before starting
    const trimmedSubject = subject.trim()
    if (!trimmedSubject) {
      setSubjectError(true)
      setTimeout(() => setSubjectError(false), 2000)
      return
    }
    setSubjectError(false)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined }
      })
      if (videoRef.current) videoRef.current.srcObject = stream

      let newSessionId = `local-${Date.now()}`
      try {
        const result = await api.startSession(TEACHER_ID, trimmedSubject)
        if (result.sessionId) newSessionId = result.sessionId
      } catch (e) {
        console.warn('Session save failed, using local ID:', newSessionId)
      }

      sessionIdRef.current = newSessionId
      setSessionId(newSessionId)
      setIsLive(true)
      setChartData([])
      // Reset sample accumulators for the new session
      engSamplesRef.current = []
      emotionSamplesRef.current = []

      intervalRef.current = setInterval(captureAndSend, 3000)
      insightIntervalRef.current = setInterval(fetchInsight, 30000) // Update every 30 seconds instead of 5 minutes
      
      // Fetch initial insight immediately
      setTimeout(fetchInsight, 5000) // Wait 5 seconds for first emotion data

      durationRef.current = 0
      setSessionDuration(0)
      timerRef.current = setInterval(() => {
        durationRef.current += 1
        setSessionDuration(durationRef.current)
      }, 1000)

    } catch (err) {
      console.error('Camera error:', err)
      alert('Camera access denied. Please allow camera permissions.')
    }
  }

  const captureAndSend = async () => {
    const activeSessionId = sessionIdRef.current
    if (!activeSessionId || !videoRef.current || !canvasRef.current) return
    const canvas = canvasRef.current
    const video = videoRef.current
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
    const imageBase64 = canvas.toDataURL('image/jpeg', 0.7)
    
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('vibelytics-settings')
    let settings = { engagementAlertThreshold: 40, alertCooldown: 15 }
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        settings = {
          engagementAlertThreshold: parsed.threshold || 40,
          alertCooldown: parsed.alertCooldown || 15
        }
      } catch (e) {
        console.error('Failed to parse settings:', e)
      }
    }
    
    try { await api.analyzeFrame(imageBase64, activeSessionId, TEACHER_ID, settings) }
    catch (err) { console.error('Frame analysis failed:', err) }
  }

  const fetchInsight = async () => {
    try {
      const data = await api.getLiveInsight(emotionsRef.current, subject, Math.floor(durationRef.current / 60))
      setLiveInsight(data.insight + (data.action ? ' ' + data.action : ''))
    } catch (err) { console.error('Insight failed:', err) }
  }

  const endSession = async () => {
    clearInterval(intervalRef.current)
    clearInterval(insightIntervalRef.current)
    clearInterval(timerRef.current)

    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop())
    }

    // Compute true session-wide average engagement (not just the last frame)
    const samples = engSamplesRef.current
    const finalEng = samples.length > 0
      ? Math.round(samples.reduce((a, b) => a + b, 0) / samples.length)
      : engRef.current

    // Compute average emotion distribution across all frames
    const emotionSamples = emotionSamplesRef.current
    const finalEmotions = emotionSamples.length > 0
      ? Object.fromEntries(
          ['happy', 'calm', 'confused', 'sad'].map(key => [
            key,
            Math.round(emotionSamples.reduce((sum, e) => sum + (e[key] || 0), 0) / emotionSamples.length)
          ])
        )
      : emotionsRef.current

    const finalDuration = Math.round(durationRef.current / 60)
    
    // Load minimum session duration from settings
    const savedSettings = localStorage.getItem('vibelytics-settings')
    let minSessionDuration = 1
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        minSessionDuration = settings.minSessionDuration || 1
      } catch (e) {
        console.error('Failed to parse settings:', e)
      }
    }
    
    // Check if session is below minimum duration
    if (finalDuration < minSessionDuration) {
      // Store pending session data and show confirmation modal
      setPendingSessionData({
        finalEmotions,
        finalEng,
        finalDuration,
        minSessionDuration
      })
      setShowConfirmModal(true)
      return
    }

    // Session is long enough, save automatically
    await saveSession(finalEmotions, finalEng, finalDuration)
  }
  
  const saveSession = async (finalEmotions, finalEng, finalDuration) => {
    try { await api.endSession(TEACHER_ID, sessionId, finalEmotions, finalEng, subject) }
    catch (e) {}

    // Show session saved modal
    const topEmotion = Object.entries(finalEmotions).sort((a, b) => b[1] - a[1])[0]?.[0] || 'happy'
    setSavedStats({
      subject: subject.trim() || 'Session',
      duration: finalDuration,
      avgEngagement: finalEng,
      peakEmotion: topEmotion
    })
    setShowSavedModal(true)
    setTimeout(() => setShowSavedModal(false), 4000)

    setIsLive(false)
    setSessionId(null)
    sessionIdRef.current = null
    setEmotions({ happy: 0, calm: 0, confused: 0, sad: 0 })
    setEngagementScore(0)
    setActiveStudents(0)
    setChartData([])
  }
  
  const handleConfirmSave = async () => {
    setShowConfirmModal(false)
    if (pendingSessionData) {
      await saveSession(
        pendingSessionData.finalEmotions,
        pendingSessionData.finalEng,
        pendingSessionData.finalDuration
      )
      setPendingSessionData(null)
    }
  }
  
  const handleCancelSave = () => {
    setShowConfirmModal(false)
    // Don't save, just reset UI
    setIsLive(false)
    setSessionId(null)
    sessionIdRef.current = null
    setEmotions({ happy: 0, calm: 0, confused: 0, sad: 0 })
    setEngagementScore(0)
    setActiveStudents(0)
    setChartData([])
    setPendingSessionData(null)
  }

  const pieData = [
    { name: 'Engaged', value: engagementScore },
    { name: 'Remaining', value: 100 - engagementScore }
  ]
  const noFacesDetected = isLive && activeStudents === 0

  const hrs = Math.floor(sessionDuration / 3600)
  const mins = Math.floor((sessionDuration % 3600) / 60)
  const secs = sessionDuration % 60
  const timeStr = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`

  const mockStudents = Array.from({ length: isLive ? Math.max(activeStudents, 1) : 35 }, (_, i) => {
    if (!isLive) {
      return { id: i, name: `Student ${i + 1}`, status: 'offline', emotion: null }
    }
    
    // When live, distribute emotions based on current emotion data
    const rand = Math.random() * 100
    let emotion = 'happy'
    let status = 'engaged'
    
    // Use actual emotion percentages to determine student emotions
    if (rand < emotions.confused) {
      emotion = 'confused'
      status = 'confused'
    } else if (rand < emotions.confused + emotions.sad) {
      emotion = 'sad'
      status = 'sad'
    } else if (rand < emotions.confused + emotions.sad + emotions.calm) {
      emotion = 'calm'
      status = 'engaged'
    } else {
      emotion = 'happy'
      status = 'engaged'
    }
    
    return { id: i, name: `Student ${i + 1}`, status, emotion }
  })

  const emotionLabel = { happy: 'Happy', calm: 'Calm', confused: 'Confused', sad: 'Sad' }

  const playAlertSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  }

  const dismissAlert = (alertId) => {
    setActiveAlerts(prev => prev.filter(a => a.id !== alertId))
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Live Tracking Cockpit</h1>
          <p className="page-subtitle">Real-time engagement tracking and active student grid view.</p>
        </div>
      </div>

      <div className="live-feed-top" style={{ display: 'grid', gridTemplateColumns: '1.7fr 1.3fr', gap: '1.5rem', marginTop: 0 }}>

        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

          {/* Top Session Info Bar */}
          <div className="soft-card" style={{ padding: '0.65rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1.25rem', overflow: 'visible' }}>

            {/* Left group: Subject + Camera */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>

              {/* Subject */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
                <BookOpen size={14} className="text-primary" style={{ flexShrink: 0 }} />
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => { setSubject(e.target.value); setSubjectError(false) }}
                    disabled={isLive}
                    placeholder="Enter subject..."
                    style={{
                      border: subjectError ? '2px solid var(--danger)' : '1.5px solid #e2e8f0',
                      background: subjectError ? 'var(--danger-light)' : '#f8fafc',
                      fontWeight: 700, fontSize: '0.82rem',
                      color: 'var(--text-main)',
                      width: '145px', outline: 'none',
                      cursor: isLive ? 'default' : 'text',
                      borderRadius: '9px', padding: '0.32rem 0.65rem',
                      animation: subjectError ? 'shake 0.4s ease' : 'none',
                      transition: 'border 0.2s, background 0.2s'
                    }}
                  />
                  {subjectError && (
                    <div style={{ position: 'absolute', top: '110%', left: 0, whiteSpace: 'nowrap', fontSize: '0.68rem', color: 'var(--danger)', fontWeight: 700, background: 'var(--danger-light)', padding: '0.15rem 0.4rem', borderRadius: '5px', marginTop: '2px', zIndex: 10 }}>
                      Please enter a subject name
                    </div>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div style={{ width: '1px', height: '22px', backgroundColor: '#e2e8f0', flexShrink: 0 }} />

              {/* Camera selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0, overflow: 'visible' }}>
                <Camera size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                {videoDevices.length > 0 ? (
                  isLive ? (
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                      {videoDevices.find(d => d.deviceId === selectedDeviceId)?.label || videoDevices[0]?.label || 'Built-in Camera'}
                    </span>
                  ) : (
                    <div ref={cameraDropdownRef} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', minWidth: 0 }}>
                      <button
                        onClick={() => setCameraDropdownOpen(o => !o)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.35rem',
                          background: cameraDropdownOpen ? '#e0f2fe' : '#f1f5f9',
                          border: cameraDropdownOpen ? '1.5px solid var(--primary)' : '1.5px solid #e2e8f0',
                          borderRadius: '9px', padding: '0.3rem 0.6rem 0.3rem 0.7rem',
                          cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem',
                          color: 'var(--text-main)', outline: 'none',
                          maxWidth: '220px', whiteSpace: 'nowrap',
                          overflow: 'hidden', transition: 'all 0.15s',
                          boxShadow: cameraDropdownOpen ? '0 0 0 3px rgba(56,189,248,0.15)' : 'none'
                        }}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px', display: 'block' }}>
                          {videoDevices.find(d => d.deviceId === selectedDeviceId)?.label || videoDevices[0]?.label || 'Select Camera'}
                        </span>
                        <ChevronDown size={13} style={{ flexShrink: 0, color: 'var(--primary)', transition: 'transform 0.2s', transform: cameraDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                      </button>

                      {cameraDropdownOpen && (
                        <div style={{
                          position: 'absolute', top: 'calc(100% + 8px)', left: 0,
                          background: '#fff', border: '1.5px solid #e2e8f0',
                          borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                          zIndex: 9999, minWidth: '230px', padding: '4px'
                        }}>
                          <div style={{ padding: '0.45rem 0.8rem 0.3rem', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Select Camera
                          </div>
                          {videoDevices.map((device, idx) => {
                            const isSel = device.deviceId === selectedDeviceId
                            return (
                              <div
                                key={device.deviceId}
                                onClick={() => { setSelectedDeviceId(device.deviceId); setCameraDropdownOpen(false) }}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', padding: '0.5rem 0.8rem', borderRadius: '8px', cursor: 'pointer', background: isSel ? '#e0f2fe' : 'transparent', color: isSel ? 'var(--primary)' : 'var(--text-main)', fontWeight: isSel ? 800 : 600, fontSize: '0.8rem', transition: 'background 0.12s' }}
                                onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = '#f8fafc' }}
                                onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent' }}
                              >
                                <Camera size={12} style={{ flexShrink: 0, opacity: isSel ? 1 : 0.5 }} />
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{device.label || `Camera ${idx + 1}`}</span>
                                {isSel && <span style={{ marginLeft: 'auto', fontSize: '0.65rem', fontWeight: 900, color: 'var(--primary)', background: '#bae6fd', borderRadius: '4px', padding: '1px 6px' }}>ACTIVE</span>}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No camera</span>
                )}
              </div>

            </div>{/* end left group */}

            {/* Right group: Timer + Faces */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexShrink: 0 }}>

              {/* Divider */}
              <div style={{ width: '1px', height: '22px', backgroundColor: '#e2e8f0' }} />

              {/* Timer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.82rem', color: isLive ? 'var(--danger)' : 'var(--text-muted)' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: isLive ? 'var(--danger)' : '#cbd5e1', animation: isLive ? 'pulseDot 1.5s infinite' : 'none', flexShrink: 0 }} />
                {timeStr}
              </div>

              {/* Divider */}
              <div style={{ width: '1px', height: '22px', backgroundColor: '#e2e8f0' }} />

              {/* Face count */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-main)' }}>
                <Users size={13} className="text-primary" style={{ flexShrink: 0 }} />
                <span style={{ whiteSpace: 'nowrap' }}>
                  {isLive
                    ? activeStudents > 0
                      ? `${activeStudents} ${activeStudents === 1 ? 'face' : 'faces'}`
                      : 'Detecting...'
                    : 'No faces yet'}
                </span>
              </div>

            </div>{/* end right group */}

          </div>

          {/* Main Video Box */}
          <div className="soft-card" style={{ padding: 0, overflow: 'hidden', position: 'relative', aspectRatio: '16/9', backgroundColor: '#0f172a' }}>
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* LIVE / OFFLINE Badge + End Button */}
            <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', right: '1.5rem', zIndex: 10, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ backgroundColor: isLive ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.1)', color: isLive ? 'var(--danger)' : '#fff', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-pill)', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', border: `1px solid ${isLive ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.2)'}` }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isLive ? 'var(--danger)' : '#fff', animation: isLive ? 'pulseDot 1.5s infinite' : 'none' }} /> {isLive ? 'LIVE' : 'OFFLINE'}
              </span>
              {isLive && (
                <button onClick={endSession} style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.3)', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-pill)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', backdropFilter: 'blur(4px)', fontWeight: 700, fontSize: '0.75rem' }}>
                  <Square size={12} fill="currentColor" /> End Session
                </button>
              )}
            </div>

            {/* Start Button (when offline) */}
            {!isLive && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem', letterSpacing: '2px', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>START MONITORING</div>
                <button onClick={startSession} style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: 'rgba(56, 189, 248, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none', boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)' }}>
                  <Play size={32} fill="#fff" color="#fff" style={{ marginLeft: '4px' }} />
                </button>
              </div>
            )}

            {/* Doughnut overlay (when live) */}
            {isLive && (
              <div style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem', zIndex: 10, width: '120px', height: '120px', backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'relative', width: '90px', height: '90px' }}>
                  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                    <PieChart>
                      <Pie data={noFacesDetected ? [{ name: 'bg', value: 100 }] : pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={40} startAngle={90} endAngle={-270} dataKey="value" stroke="none" cornerRadius={10} animationDuration={1000}>
                        {(noFacesDetected ? [{}] : pieData).map((_, index) => (
                          <Cell key={index} fill={noFacesDetected ? 'rgba(255,255,255,0.1)' : index === 0 ? 'var(--success)' : 'rgba(255,255,255,0.1)'} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', color: '#fff', fontSize: noFacesDetected ? '1.4rem' : '1.1rem', fontWeight: 800 }}>
                    {noFacesDetected ? '—' : `${engagementScore}%`}
                  </div>
                </div>
              </div>
            )}

            {/* Problem 4: No faces detected overlay */}
            {noFacesDetected && (
              <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', zIndex: 10, backgroundColor: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(8px)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Eye size={18} color="#94a3b8" />
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff', marginBottom: '0.1rem' }}>No faces detected</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>Point camera toward students</div>
                </div>
              </div>
            )}

            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0) 30%, rgba(15,23,42,0) 70%, rgba(15,23,42,0.7) 100%)', zIndex: 5, pointerEvents: 'none' }} />
            <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isLive ? 1 : 0.3, transition: 'opacity 0.5s', transform: 'scaleX(-1)' }} />
            {!isLive && (
              <img src="https://images.unsplash.com/photo-1540039155732-678122d1b913?auto=format&fit=crop&q=80&w=1280" alt="placeholder" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3, zIndex: 1 }} />
            )}
          </div>

          {/* Emotion Pills — Problem 4: show "—" when no faces detected */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
            {[
              { key: 'happy', label: 'HAPPY', Icon: Smile, color: 'var(--success)', bg: '#dcfce7', highlight: emotions.happy > 60 },
              { key: 'calm', label: 'CALM', Icon: Meh, color: 'var(--primary)', bg: 'var(--primary-light)', highlight: false },
              { key: 'confused', label: 'CONFUSED', Icon: HelpCircle, color: 'var(--warning)', bg: '#fef9c3', highlight: emotions.confused > 15 },
              { key: 'sad', label: 'SAD', Icon: Frown, color: 'var(--danger)', bg: 'var(--danger-light)', highlight: false }
            ].map(({ key, label, Icon, color, bg, highlight }) => (
              <div key={key} className="soft-card" style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: isLive && highlight ? `2px solid ${color}` : '2px solid transparent' }}>
                <div style={{ backgroundColor: bg, width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color={color} />
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }}>{label}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color }}>
                    {isLive && !noFacesDetected ? `${emotions[key]}%` : isLive && noFacesDetected ? '—' : '--'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Live Chart — Problem 2: empty state */}
          <div className="soft-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', height: '140px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={14} className="text-primary" /> Live Chart (Last 10 Min)
              </div>
            </div>
            <div style={{ flexGrow: 1, marginLeft: '-20px', minHeight: 0 }}>
              {isLive && chartData.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={3} fill="url(#colorValue)" isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : isLive && chartData.length <= 1 ? (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, gap: '0.25rem' }}>
                  <div style={{ letterSpacing: '1px', fontSize: '1rem', color: 'var(--primary)', opacity: 0.6 }}>〰</div>
                  <div>Chart will populate as session progresses</div>
                  <div style={{ fontSize: '0.72rem', opacity: 0.7 }}>First data point appears in ~3 seconds</div>
                </div>
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
                  Awaiting session start...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
          <div className="soft-card" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0, padding: 0 }}>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9', padding: '1rem 1.5rem 0' }}>
              <button onClick={() => setActiveTab('grid')} style={{ padding: '0.5rem 1rem', border: 'none', background: 'transparent', cursor: 'pointer', borderBottom: activeTab === 'grid' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'grid' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 800, fontSize: '0.9rem', flexGrow: 1 }}>
                Student Grid
              </button>
              <button onClick={() => setActiveTab('alerts')} style={{ padding: '0.5rem 1rem', border: 'none', background: 'transparent', cursor: 'pointer', borderBottom: activeTab === 'alerts' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'alerts' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 800, fontSize: '0.9rem', flexGrow: 1 }}>
                Recent Alerts
              </button>
            </div>

            <div style={{ padding: '1rem 1.5rem', flexGrow: 1, overflowY: 'auto', minHeight: 0, display: 'flex', flexDirection: 'column' }}>

              {/* Alerts Tab */}
              {activeTab === 'alerts' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {alerts.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)', padding: '2rem 1rem', textAlign: 'center' }}>
                      <CheckCircle2 size={28} color="#22c55e" strokeWidth={1.5} />
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>All clear — no alerts today</div>
                      <div style={{ fontSize: '0.8rem' }}>Your class has been running smoothly.</div>
                    </div>
                  ) : alerts.slice(0, 5).map((alert) => {
                    const bgC = alert.alertType === 'confusion_spike' ? '#fef9c3' : alert.alertType === 'low_engagement' ? 'var(--danger-light)' : '#dcfce7'
                    const fgC = alert.alertType === 'confusion_spike' ? 'var(--warning)' : alert.alertType === 'low_engagement' ? 'var(--danger)' : 'var(--success)'
                    return (
                      <div key={alert.alertId} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: bgC, color: fgC, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <AlertTriangle size={16} />
                        </div>
                        <div style={{ flexGrow: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{alert.alertType?.replace('_', ' ').toUpperCase()}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{alert.message}</div>
                        </div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600 }}>
                          {new Date(alert.triggeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Student Grid Tab */}
              {activeTab === 'grid' && (
                <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem', flexGrow: 1, alignContent: 'start' }}>
                    {mockStudents.map((stu) => {
                      const statusColor = stu.status === 'engaged' ? 'var(--success)' : stu.status === 'confused' ? 'var(--warning)' : stu.status === 'sad' ? 'var(--danger)' : '#cbd5e1'
                      const bgColor = stu.status === 'offline' ? '#f1f5f9' : 
                                     stu.emotion === 'happy' ? '#dcfce7' :
                                     stu.emotion === 'calm' ? '#e0f2fe' :
                                     stu.emotion === 'confused' ? '#fef9c3' :
                                     stu.emotion === 'sad' ? '#fee2e2' : '#f1f5f9'
                      
                      const EmotionIcon = stu.emotion === 'happy' ? Smile :
                                         stu.emotion === 'calm' ? Meh :
                                         stu.emotion === 'confused' ? HelpCircle :
                                         stu.emotion === 'sad' ? Frown : User
                      
                      return (
                        <div key={stu.id} onClick={() => setSelectedStudent(stu)} style={{ 
                          aspectRatio: '1/1', 
                          backgroundColor: bgColor, 
                          borderRadius: '8px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          cursor: 'pointer', 
                          position: 'relative', 
                          border: selectedStudent?.id === stu.id ? '2px solid var(--primary)' : '2px solid transparent',
                          transition: 'all 0.2s',
                          transform: selectedStudent?.id === stu.id ? 'scale(1.05)' : 'scale(1)'
                        }}>
                          <EmotionIcon size={20} color={stu.status === 'offline' ? '#94a3b8' : statusColor} strokeWidth={2.5} />
                          {stu.status !== 'offline' && (
                            <div style={{ position: 'absolute', bottom: '4px', right: '4px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: statusColor, border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                          )}
                        </div>
                      )
                    })}
                  </div>
                  {selectedStudent && (
                    <div style={{ marginTop: '1rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <div>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>{selectedStudent.name}</h4>
                          {selectedStudent.emotion && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'capitalize', marginTop: '0.25rem' }}>
                              Emotion: {selectedStudent.emotion}
                            </div>
                          )}
                        </div>
                        <button onClick={() => setSelectedStudent(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1 }}>×</button>
                      </div>
                      <button style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <Flag size={14} /> Flag Student
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Live Insight Chip */}
            <div style={{ margin: '1rem', padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div style={{ color: '#3b82f6', marginTop: '2px' }}><Lightbulb size={16} /></div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.75rem', color: '#1e40af', marginBottom: '0.25rem', letterSpacing: '0.5px' }}>LIVE INSIGHT</div>
                <div style={{ fontSize: '0.85rem', color: '#1e3a8a', lineHeight: 1.4, fontWeight: 500 }}>
                  {isLive ? liveInsight : 'Insight engine ready.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Short Sessions */}
      {showConfirmModal && pendingSessionData && (
        <>
          {/* Backdrop */}
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 9998, animation: 'fadeIn 0.2s ease' }} onClick={handleCancelSave} />
          
          {/* Modal */}
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 9999, animation: 'scaleIn 0.3s ease' }}>
            <div style={{ backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0', padding: '2rem', minWidth: '420px', maxWidth: '500px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <AlertTriangle size={24} color="#f59e0b" />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Short Session Detected</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {pendingSessionData.finalDuration} minute{pendingSessionData.finalDuration !== 1 ? 's' : ''} · Below {pendingSessionData.minSessionDuration} min threshold
                  </div>
                </div>
              </div>
              
              <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.6, margin: 0 }}>
                  This session was shorter than your configured minimum duration. Would you like to save it to your reports anyway?
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={handleCancelSave} style={{ flex: 1, padding: '0.75rem 1.25rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', color: 'var(--text-main)', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f8fafc'}>
                  No, Discard
                </button>
                <button onClick={handleConfirmSave} style={{ flex: 1, padding: '0.75rem 1.25rem', backgroundColor: 'var(--primary)', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', color: '#fff', boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                  Yes, Save Session
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Session Saved Modal */}
      {showSavedModal && savedStats && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999, animation: 'slideUp 0.4s ease-out' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0', padding: '1.5rem', minWidth: '320px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={22} color="#22c55e" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>Session Saved</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{savedStats.subject} · {savedStats.duration} min</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '0.65rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>AVG ENGAGEMENT</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: savedStats.avgEngagement >= 75 ? '#22c55e' : savedStats.avgEngagement >= 50 ? '#f59e0b' : '#ef4444' }}>
                  {savedStats.avgEngagement > 0 ? savedStats.avgEngagement + '%' : '--'}
                </div>
              </div>
              <div style={{ backgroundColor: '#f8fafc', padding: '0.65rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>PEAK EMOTION</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'capitalize' }}>
                  {emotionLabel[savedStats.peakEmotion] || 'Happy'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => { setShowSavedModal(false); navigate('/reports') }} style={{ flex: 1, padding: '0.6rem', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '10px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                <FileText size={14} /> View in Reports
              </button>
              <button onClick={() => setShowSavedModal(false)} style={{ flex: 1, padding: '0.6rem', backgroundColor: 'var(--primary)', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                <PlayCircle size={14} /> Start New
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Notifications */}
      {activeAlerts.map((alert, index) => (
        <div key={alert.id} style={{ position: 'fixed', top: `${2 + index * 6}rem`, right: '2rem', zIndex: 10000 }}>
          <AlertNotification
            alert={alert}
            onDismiss={() => dismissAlert(alert.id)}
            autoHide={true}
            duration={5000}
          />
        </div>
      ))}

      <style>{`
        @keyframes pulseDot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.7; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </>
  )
}
