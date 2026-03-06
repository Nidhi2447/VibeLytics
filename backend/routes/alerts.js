const router = require('express').Router()
const { getDocClient, QueryCommand, UpdateCommand } = require('../lib/dynamodb')
const { getLogger } = require('../lib/logger')
const { asyncHandler } = require('../middleware/error-handler')

// Get alerts for a teacher
router.get('/', asyncHandler(async (req, res) => {
  const logger = getLogger()
  const { teacherId, limit = 10, dismissed = 'false' } = req.query

  logger.info('Fetching alerts', {
    requestId: req.id,
    teacherId,
    dismissed
  })

  const docClient = await getDocClient()
  const result = await docClient.send(new QueryCommand({
    TableName: 'vibelytics-alerts',
    KeyConditionExpression: 'teacherId = :t',
    ExpressionAttributeValues: { ':t': teacherId },
    ScanIndexForward: false, // newest first
    Limit: parseInt(limit)
  }))

  let alerts = (result.Items || []).map(a => ({
    id: a.alertId,
    type: a.alertType || 'warning',
    title: a.message || 'Alert',
    time: new Date(a.triggeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    timestamp: a.triggeredAt,
    sessionId: a.sessionId,
    dismissed: a.dismissed || false
  }))

  // Filter by dismissed status if requested
  if (dismissed === 'false') {
    alerts = alerts.filter(a => !a.dismissed)
  }

  logger.info('Alerts fetched', {
    requestId: req.id,
    count: alerts.length
  })

  res.json({ alerts, requestId: req.id })
}))

// Dismiss an alert
router.post('/dismiss', asyncHandler(async (req, res) => {
  const logger = getLogger()
  const { teacherId, alertId } = req.body

  if (!teacherId || !alertId) {
    return res.status(400).json({
      error: 'teacherId and alertId are required',
      requestId: req.id
    })
  }

  logger.info('Dismissing alert', {
    requestId: req.id,
    teacherId,
    alertId
  })

  const docClient = await getDocClient()
  await docClient.send(new UpdateCommand({
    TableName: 'vibelytics-alerts',
    Key: { teacherId, alertId },
    UpdateExpression: 'SET dismissed = :d, dismissedAt = :t',
    ExpressionAttributeValues: {
      ':d': true,
      ':t': new Date().toISOString()
    }
  }))

  logger.info('Alert dismissed', {
    requestId: req.id,
    alertId
  })

  res.json({ success: true, requestId: req.id })
}))

// Dismiss all alerts for a teacher
router.post('/dismiss-all', asyncHandler(async (req, res) => {
  const logger = getLogger()
  const { teacherId } = req.body

  if (!teacherId) {
    return res.status(400).json({
      error: 'teacherId is required',
      requestId: req.id
    })
  }

  logger.info('Dismissing all alerts', {
    requestId: req.id,
    teacherId
  })

  const docClient = await getDocClient()
  
  // First, get all alerts
  const result = await docClient.send(new QueryCommand({
    TableName: 'vibelytics-alerts',
    KeyConditionExpression: 'teacherId = :t',
    ExpressionAttributeValues: { ':t': teacherId }
  }))

  // Dismiss each one
  const dismissPromises = (result.Items || []).map(alert =>
    docClient.send(new UpdateCommand({
      TableName: 'vibelytics-alerts',
      Key: { teacherId, alertId: alert.alertId },
      UpdateExpression: 'SET dismissed = :d, dismissedAt = :t',
      ExpressionAttributeValues: {
        ':d': true,
        ':t': new Date().toISOString()
      }
    }))
  )

  await Promise.all(dismissPromises)

  logger.info('All alerts dismissed', {
    requestId: req.id,
    count: dismissPromises.length
  })

  res.json({ success: true, count: dismissPromises.length, requestId: req.id })
}))

module.exports = router
