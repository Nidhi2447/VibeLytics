const router = require('express').Router();
const { analyzeFrame } = require('../lib/rekognition');
const { getDocClient, PutCommand } = require('../lib/dynamodb');
const { checkAndFireAlerts } = require('../lib/alerts');
const { getLogger } = require('../lib/logger');
const { asyncHandler } = require('../middleware/error-handler');
const { validateRequired, validateImageBase64 } = require('../middleware/validator');
const { v4: uuidv4 } = require('uuid');

const DEMO_TEACHER_PREFS = { engagementAlertThreshold: 40, alertCooldown: 15 };

router.post('/frame', 
  validateRequired(['imageBase64', 'sessionId', 'teacherId']),
  validateImageBase64,
  asyncHandler(async (req, res) => {
    const logger = getLogger();
    const startTime = Date.now();
    
    const { imageBase64, sessionId, teacherId, settings } = req.body;
    
    // Use settings from request or fall back to defaults
    const teacherPrefs = settings || DEMO_TEACHER_PREFS;

    logger.info('Frame analysis started', { 
      requestId: req.id,
      sessionId, 
      teacherId,
      imageSize: imageBase64.length 
    });

    // Call Rekognition
    const { faces, emotions, engagementScore } = await analyzeFrame(imageBase64);

    const timestamp = new Date().toISOString();

    // Save to DynamoDB
    try {
      const docClient = await getDocClient();
      await docClient.send(new PutCommand({
        TableName: 'vibelytics-snapshots',
        Item: {
          sessionId,
          timestamp,
          emotions,
          engagementScore,
          facesDetected: faces
        }
      }));
      logger.info('Snapshot saved to DynamoDB', { requestId: req.id, sessionId });
    } catch (dbErr) {
      logger.error('DynamoDB save failed', { 
        requestId: req.id,
        sessionId, 
        error: dbErr.message 
      });
    }

    // Check alerts
    try {
      await checkAndFireAlerts(
        teacherId, sessionId, emotions,
        engagementScore, req.io, teacherPrefs
      );
    } catch (alertErr) {
      logger.error('Alert check failed', { 
        requestId: req.id,
        sessionId, 
        error: alertErr.message 
      });
    }

    // Emit real-time update
    req.io.to(teacherId).emit('emotion_update', {
      emotions,
      engagementScore,
      activeStudents: faces,
      timestamp
    });

    const duration = Date.now() - startTime;
    logger.info('Frame analysis completed', { 
      requestId: req.id,
      sessionId,
      duration: `${duration}ms`,
      engagementScore
    });

    res.json({ 
      success: true, 
      emotions, 
      engagementScore, 
      facesDetected: faces,
      requestId: req.id
    });
  })
);

module.exports = router;
