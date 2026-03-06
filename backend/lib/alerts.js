const { getDocClient, PutCommand } = require('./dynamodb')
const { v4: uuidv4 } = require('uuid')

// Track previous snapshot per session to detect spikes
const prevSnapshots = {}
// Track last alert time per session to prevent spam
const lastAlertTimes = {}

async function checkAndFireAlerts(teacherId, sessionId, emotions, engagementScore, io, teacherPrefs) {
  const threshold = teacherPrefs?.engagementAlertThreshold || 40
  const cooldownSeconds = teacherPrefs?.alertCooldown || 15 // Use setting or default to 15 seconds
  const prev = prevSnapshots[sessionId]
  const alerts = []
  const now = Date.now()
  
  // Initialize last alert times for this session if not exists
  if (!lastAlertTimes[sessionId]) {
    lastAlertTimes[sessionId] = {
      confusion_spike: 0,
      low_engagement: 0
    }
  }
  
  const COOLDOWN_MS = cooldownSeconds * 1000 // Convert seconds to milliseconds

  // Confusion spike: confused >15% for 2 consecutive snapshots
  if (emotions.confused > 15 && prev && prev.confused > 15) {
    // Only fire if cooldown has passed
    if (now - lastAlertTimes[sessionId].confusion_spike > COOLDOWN_MS) {
      const alert = {
        teacherId,
        alertId: `${Date.now()}-${uuidv4()}`,
        sessionId,
        alertType: 'confusion_spike',
        message: `Confusion spike — ${emotions.confused}% students appear confused.`,
        triggeredAt: new Date().toISOString(),
        dismissed: false
      }
      await saveAlert(alert)
      io.to(teacherId).emit('alert_triggered', alert)
      alerts.push(alert)
      lastAlertTimes[sessionId].confusion_spike = now
    }
  }

  // Low engagement
  if (engagementScore < threshold) {
    // Only fire if cooldown has passed
    if (now - lastAlertTimes[sessionId].low_engagement > COOLDOWN_MS) {
      const alert = {
        teacherId,
        alertId: `${Date.now()}-${uuidv4()}`,
        sessionId,
        alertType: 'low_engagement',
        message: `Engagement dropped to ${engagementScore}% — below your threshold of ${threshold}%.`,
        triggeredAt: new Date().toISOString(),
        dismissed: false
      }
      await saveAlert(alert)
      io.to(teacherId).emit('alert_triggered', alert)
      alerts.push(alert)
      lastAlertTimes[sessionId].low_engagement = now
    }
  }

  // Update prev snapshot
  prevSnapshots[sessionId] = emotions
  return alerts
}

async function saveAlert(alert) {
  const docClient = await getDocClient()
  await docClient.send(new PutCommand({
    TableName: 'vibelytics-alerts',
    Item: alert
  }))
}

module.exports = { checkAndFireAlerts }
