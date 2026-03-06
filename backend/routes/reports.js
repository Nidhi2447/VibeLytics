const router = require('express').Router()
const { getDocClient, QueryCommand } = require('../lib/dynamodb')
const { getLogger } = require('../lib/logger')
const { asyncHandler } = require('../middleware/error-handler')

// --- Helpers ---
function getVibeColor(score) {
  if (score >= 75) return 'green'
  if (score >= 50) return 'amber'
  return 'red'
}

function isValidSession(s, minDurationMinutes = 1) {
  if (!s || s.status !== 'ended') return false
  
  // Require a real, non-empty subject name
  const sub = (s.subject || '').trim().toLowerCase()
  if (!sub || sub === 'unknown' || sub === 'unnamed session') return false
  
  // Filter out sessions less than minimum duration
  if (s.startTime && s.endTime) {
    const startMs = new Date(s.startTime).getTime()
    const endMs = new Date(s.endTime).getTime()
    const durationMinutes = (endMs - startMs) / 60000
    
    if (durationMinutes < minDurationMinutes) {
      return false
    }
  }
  
  return true
}

function calcStreak(sessions) {
  // Get unique days that had at least 1 valid ended session, sorted desc
  const days = [...new Set(
    sessions.map(s => new Date(s.startTime).toDateString())
  )].map(d => new Date(d)).sort((a, b) => b - a)

  if (days.length === 0) return 0

  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 86400000).toDateString()

  // Streak only counts if teacher taught today OR yesterday (grace period)
  if (days[0].toDateString() !== today && days[0].toDateString() !== yesterday) return 0

  let streak = 1
  for (let i = 1; i < days.length; i++) {
    const diff = (days[i - 1] - days[i]) / 86400000
    if (diff <= 1.5) streak++ // allow same-day
    else break
  }
  return streak
}

function buildEmptyWeeklyTrend() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return { day: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }), engagement: 0, confusion: 0 }
  })
}

function buildWeeklyTrend(sessions) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toDateString()
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    const daySessions = sessions.filter(s => new Date(s.startTime).toDateString() === dateStr)
    const engagement = daySessions.length === 0 ? 0
      : Math.round(daySessions.reduce((sum, s) => sum + (s.avgEngagement || 0), 0) / daySessions.length)
    const confusion = daySessions.length === 0 ? 0
      : Math.round(daySessions.reduce((sum, s) => sum + (s.emotionSummary?.confused || 0), 0) / daySessions.length)
    return { day: dayLabel, engagement, confusion }
  })
}

router.get('/summary', asyncHandler(async (req, res) => {
  const logger = getLogger()
  const { teacherId, minSessionDuration } = req.query
  const minDuration = parseInt(minSessionDuration) || 1 // Default to 1 minute

  logger.info('Fetching reports summary', {
    requestId: req.id,
    teacherId,
    minSessionDuration: minDuration
  })

  const docClient = await getDocClient()
  const result = await docClient.send(new QueryCommand({
    TableName: 'vibelytics-sessions',
    KeyConditionExpression: 'teacherId = :t',
    ExpressionAttributeValues: { ':t': teacherId }
  }))

  const rawSessions = result.Items || []
  logger.info('Raw sessions fetched', {
    requestId: req.id,
    count: rawSessions.length
  })

  // Strict filter: valid subject, minimum duration, avgEngagement > 0, status ended
  const sessions = rawSessions.filter(s => isValidSession(s, minDuration))
  
  logger.info('Valid sessions after filtering', {
    requestId: req.id,
    count: sessions.length
  })

    // Today's stats
    const todayStr = new Date().toDateString()
    const todaySessions = sessions.filter(s => new Date(s.startTime).toDateString() === todayStr)
    const todayAvgEngagement = todaySessions.length === 0 ? 0
      : Math.round(todaySessions.reduce((sum, s) => sum + (s.avgEngagement || 0), 0) / todaySessions.length)

    // Most common emotion
    const emotionCounts = { happy: 0, calm: 0, confused: 0, sad: 0 }
    sessions.forEach(s => {
      if (s.emotionSummary) {
        const top = Object.entries(s.emotionSummary).sort((a, b) => b[1] - a[1])[0]
        if (top && emotionCounts.hasOwnProperty(top[0])) emotionCounts[top[0]]++
      }
    })
    const mostCommonEmotion = sessions.length === 0 ? 'N/A'
      : Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'happy'

    const lastSession = sessions
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))[0] || null

    if (sessions.length === 0) {
      return res.json({
        totalSessions: 0, avgEngagement: 0,
        bestSubject: 'N/A', mostConfusedTopic: null, bestTimeOfDay: null,
        bestSession: null, pastSessions: [],
        weeklyTrend: buildEmptyWeeklyTrend(), subjectEngagement: [],
        todaySessions: 0, todayAvgEngagement: 0, mostCommonEmotion: 'N/A', lastSession: null,
        streak: 0, weekOverWeekChange: 0, bestSessionThisWeek: null
      })
    }

    const avgEngagement = Math.round(
      sessions.reduce((sum, s) => sum + (s.avgEngagement || 0), 0) / sessions.length
    )

    // Best subject vs most confused (per subject)
    const subjectMap = {}
    sessions.forEach(s => {
      if (!s.subject) return
      if (!subjectMap[s.subject]) subjectMap[s.subject] = { avgEngList: [], confusedList: [] }
      subjectMap[s.subject].avgEngList.push(s.avgEngagement || 0)
      subjectMap[s.subject].confusedList.push(s.emotionSummary?.confused || 0)
    })
    const subjectStats = Object.entries(subjectMap).map(([sub, d]) => ({
      subject: sub,
      avgEng: Math.round(d.avgEngList.reduce((a, b) => a + b, 0) / d.avgEngList.length),
      avgConfused: Math.round(d.confusedList.reduce((a, b) => a + b, 0) / d.confusedList.length)
    }))
    const bestSubjectEntry = subjectStats.reduce((a, b) => a.avgEng > b.avgEng ? a : b)
    const bestSubject = bestSubjectEntry.subject

    let mostConfusedTopic = null
    let bestTimeOfDay = null
    if (subjectStats.length >= 2) {
      const confusedEntry = subjectStats.reduce((a, b) => a.avgConfused > b.avgConfused ? a : b)
      mostConfusedTopic = confusedEntry.subject === bestSubject ? null : confusedEntry.subject
    }
    if (!mostConfusedTopic) {
      const hourMap = {}
      sessions.forEach(s => {
        const h = new Date(s.startTime).getHours()
        const label = h < 12 ? `${h}:00 AM` : h === 12 ? '12:00 PM' : `${h - 12}:00 PM`
        if (!hourMap[label]) hourMap[label] = []
        hourMap[label].push(s.avgEngagement || 0)
      })
      const best = Object.entries(hourMap)
        .map(([hr, arr]) => ({ hr, avg: Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) }))
        .sort((a, b) => b.avg - a.avg)[0]
      bestTimeOfDay = best ? best.hr : null
    }

    // BEST SESSION (all time)
    const bestSessionRaw = sessions.reduce((a, b) => (a.avgEngagement || 0) > (b.avgEngagement || 0) ? a : b)
    const bsStartMs = new Date(bestSessionRaw.startTime).getTime()
    const bsEndMs = bestSessionRaw.endTime ? new Date(bestSessionRaw.endTime).getTime() : bsStartMs
    const bestSession = {
      subject: bestSessionRaw.subject,
      date: new Date(bestSessionRaw.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      duration: Math.round((bsEndMs - bsStartMs) / 60000) + ' min',
      avgVibe: Math.round(bestSessionRaw.avgEngagement || 0),
      peakEmotion: bestSessionRaw.peakEmotion || 'happy'
    }

    // BEST SESSION THIS WEEK (for streak bar)
    const weekAgo = Date.now() - 7 * 86400000
    const thisWeekSessions = sessions.filter(s => new Date(s.startTime).getTime() >= weekAgo)
    const bestThisWeek = thisWeekSessions.length > 0
      ? thisWeekSessions.reduce((a, b) => (a.avgEngagement || 0) > (b.avgEngagement || 0) ? a : b)
      : null

    // WEEK-OVER-WEEK CHANGE
    const twoWeeksAgo = Date.now() - 14 * 86400000
    const prevWeekSessions = sessions.filter(s => {
      const t = new Date(s.startTime).getTime()
      return t >= twoWeeksAgo && t < weekAgo
    })
    const thisWeekAvg = thisWeekSessions.length > 0
      ? Math.round(thisWeekSessions.reduce((s, x) => s + (x.avgEngagement || 0), 0) / thisWeekSessions.length)
      : 0
    const prevWeekAvg = prevWeekSessions.length > 0
      ? Math.round(prevWeekSessions.reduce((s, x) => s + (x.avgEngagement || 0), 0) / prevWeekSessions.length)
      : 0
    const weekOverWeekChange = prevWeekAvg > 0 ? thisWeekAvg - prevWeekAvg : 0

    // STREAK
    const streak = calcStreak(sessions)

    // Past sessions — filtered, sorted, max 15 for pagination on frontend
    const pastSessions = sessions
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
      .slice(0, 15)
      .map(s => {
        const startMs = new Date(s.startTime).getTime()
        const endMs = s.endTime ? new Date(s.endTime).getTime() : startMs
        const durationSecs = Math.round((endMs - startMs) / 1000)
        const durationMins = Math.round(durationSecs / 60)
        const durationDisplay = durationMins >= 1 ? `${durationMins} min` : `${durationSecs} sec`
        const avgVibe = Math.round(s.avgEngagement || 0)
        return {
          id: s.sessionId,
          date: new Date(s.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          subject: s.subject,
          avgVibe,
          vibeColor: getVibeColor(avgVibe),
          peakEmotion: s.peakEmotion || 'calm',
          duration: durationDisplay,
          durationMins,
          sessionId: s.sessionId,
          summary: s.summary || '',
          emotionSummary: s.emotionSummary || null,
          timeline: [], moments: []
        }
      })

    const weeklyTrend = buildWeeklyTrend(sessions)

    const subjectEngagement = subjectStats.map(s => ({
      subject: s.subject, engagement: s.avgEng, color: getVibeColor(s.avgEng)
    })).sort((a, b) => b.engagement - a.engagement)

    res.json({
      totalSessions: sessions.length, avgEngagement, bestSubject,
      mostConfusedTopic, bestTimeOfDay, bestSession,
      pastSessions, weeklyTrend, subjectEngagement,
      todaySessions: todaySessions.length, todayAvgEngagement, mostCommonEmotion,
      lastSession: lastSession ? {
        subject: lastSession.subject,
        startTime: lastSession.startTime,
        endTime: lastSession.endTime,
        avgEngagement: Math.round(lastSession.avgEngagement || 0),
        peakEmotion: lastSession.peakEmotion || 'calm',
        duration: lastSession.endTime
          ? Math.round((new Date(lastSession.endTime) - new Date(lastSession.startTime)) / 60000) + ' min'
          : 'N/A'
      } : null,
      streak,
      weekOverWeekChange,
      bestSessionThisWeek: bestThisWeek ? {
        subject: bestThisWeek.subject,
        avgVibe: Math.round(bestThisWeek.avgEngagement || 0)
      } : null,
      requestId: req.id
    })

  logger.info('Reports summary sent', {
    requestId: req.id,
    totalSessions: sessions.length
  })
}))

module.exports = router
