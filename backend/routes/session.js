const router = require('express').Router();
const { getDocClient, PutCommand, UpdateCommand, QueryCommand } = require('../lib/dynamodb');
const { getLogger } = require('../lib/logger');
const { asyncHandler } = require('../middleware/error-handler');
const { validateRequired, validateSubject } = require('../middleware/validator');
const { v4: uuidv4 } = require('uuid');
const { generateInsight } = require('../lib/bedrock');
const cache = require('../lib/cache');

// Start session
router.post('/start',
  validateRequired(['teacherId', 'subject']),
  validateSubject,
  asyncHandler(async (req, res) => {
    const logger = getLogger();
    const { teacherId, subject, sectionName } = req.body;
    const sessionId = uuidv4();
    const startTime = new Date().toISOString();

    logger.info('Starting new session', {
      requestId: req.id,
      teacherId,
      subject,
      sessionId
    });

    try {
      const docClient = await getDocClient();
      await docClient.send(new PutCommand({
        TableName: 'vibelytics-sessions',
        Item: {
          teacherId,
          sessionId,
          subject: subject.trim(),
          sectionName: sectionName || 'Section 10-B',
          startTime,
          status: 'active',
          avgEngagement: 0,
          peakEmotion: 'happy',
          totalStudentsDetected: 0
        }
      }));
      
      logger.info('Session created in DynamoDB', {
        requestId: req.id,
        sessionId
      });
    } catch (err) {
      logger.error('Failed to save session to DynamoDB', {
        requestId: req.id,
        sessionId,
        error: err.message
      });
    }

    res.json({ success: true, sessionId, startTime, requestId: req.id });
  })
);

// End session
router.post('/end',
  validateRequired(['teacherId', 'sessionId']),
  asyncHandler(async (req, res) => {
    const logger = getLogger();
    const { teacherId, sessionId, finalEmotions, avgEngagement, subject } = req.body;
    const endTime = new Date().toISOString();

    logger.info('Ending session', {
      requestId: req.id,
      teacherId,
      sessionId,
      avgEngagement
    });

    let summary = 'Session completed successfully.';
    try {
      const insight = await generateInsight(
        finalEmotions || { happy: 50, calm: 30, confused: 15, sad: 5 }, 
        subject || 'Unknown', 
        0
      );
      summary = insight.insight;
    } catch (e) {
      logger.warn('Bedrock insight generation failed', {
        requestId: req.id,
        error: e.message
      });
    }

    const emotionsData = finalEmotions || {};
    const peakEmotion = Object.keys(emotionsData).length > 0
      ? Object.entries(emotionsData).sort((a, b) => b[1] - a[1])[0]?.[0] || 'happy'
      : 'happy';

    try {
      const docClient = await getDocClient();
      await docClient.send(new UpdateCommand({
        TableName: 'vibelytics-sessions',
        Key: { teacherId, sessionId },
        UpdateExpression: 'SET #s = :s, endTime = :e, avgEngagement = :a, emotionSummary = :em, summary = :sum, peakEmotion = :pe',
        ExpressionAttributeNames: { '#s': 'status' },
        ExpressionAttributeValues: {
          ':s': 'ended',
          ':e': endTime,
          ':a': avgEngagement || 0,
          ':em': emotionsData,
          ':sum': summary,
          ':pe': peakEmotion
        }
      }));
      
      logger.info('Session ended successfully', {
        requestId: req.id,
        sessionId
      });
      
      // Clear cache for this teacher
      cache.delete(`summary:${teacherId}`);
    } catch (err) {
      logger.error('Failed to update session in DynamoDB', {
        requestId: req.id,
        sessionId,
        error: err.message
      });
    }

    res.json({ success: true, summary, endTime, requestId: req.id });
  })
);

// Get all sessions for teacher
router.get('/all', asyncHandler(async (req, res) => {
  const logger = getLogger();
  const { teacherId } = req.query;

  if (!teacherId) {
    return res.status(400).json({
      error: 'teacherId is required',
      requestId: req.id
    });
  }

  logger.info('Fetching sessions', {
    requestId: req.id,
    teacherId
  });

  try {
    const docClient = await getDocClient();
    const result = await docClient.send(new QueryCommand({
      TableName: 'vibelytics-sessions',
      KeyConditionExpression: 'teacherId = :t',
      ExpressionAttributeValues: { ':t': teacherId }
    }));

    const sorted = (result.Items || []).sort(
      (a, b) => new Date(b.startTime) - new Date(a.startTime)
    );
    
    logger.info('Sessions fetched', {
      requestId: req.id,
      count: sorted.length
    });
    
    res.json({ sessions: sorted, requestId: req.id });
  } catch (err) {
    logger.error('Failed to fetch sessions', {
      requestId: req.id,
      teacherId,
      error: err.message
    });
    res.json({ sessions: [], requestId: req.id });
  }
}));

module.exports = router;
