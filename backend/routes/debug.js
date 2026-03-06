const router = require('express').Router()
const { getDocClient, QueryCommand } = require('../lib/dynamodb')
const { asyncHandler } = require('../middleware/error-handler')

// Debug endpoint to see all sessions
router.get('/sessions', asyncHandler(async (req, res) => {
  const { teacherId } = req.query
  
  const docClient = await getDocClient()
  const result = await docClient.send(new QueryCommand({
    TableName: 'vibelytics-sessions',
    KeyConditionExpression: 'teacherId = :t',
    ExpressionAttributeValues: { ':t': teacherId }
  }))

  const sessions = result.Items || []
  
  res.json({
    total: sessions.length,
    sessions: sessions.map(s => ({
      sessionId: s.sessionId,
      subject: s.subject,
      status: s.status,
      startTime: s.startTime,
      endTime: s.endTime,
      avgEngagement: s.avgEngagement,
      emotionSummary: s.emotionSummary
    }))
  })
}))

module.exports = router
