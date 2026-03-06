const router = require('express').Router()
const { generateInsight, generateWeeklySummary } = require('../lib/bedrock')
const { getLogger } = require('../lib/logger')
const { asyncHandler } = require('../middleware/error-handler')

// Daily dashboard insight
router.post('/daily', asyncHandler(async (req, res) => {
  const logger = getLogger()
  const { avgEngagement, mostCommonEmotion, weekOverWeekChange, totalSessions, activeClass } = req.body
  
  logger.info('Generating daily insight', {
    requestId: req.id,
    avgEngagement,
    mostCommonEmotion
  })
  
  try {
    // Create a prompt for Bedrock based on the data
    const prompt = `You are an AI teaching assistant analyzing classroom engagement data.

Current Statistics:
- Average Engagement: ${avgEngagement}%
- Most Common Emotion: ${mostCommonEmotion}
- Week-over-Week Change: ${weekOverWeekChange > 0 ? '+' : ''}${weekOverWeekChange}%
- Total Sessions: ${totalSessions}
- Class: ${activeClass}

Provide a brief, actionable insight (2-3 sentences) for the teacher about their classroom engagement patterns. Be specific, encouraging, and provide one concrete recommendation.

Format: Just the insight text, no labels or formatting.`

    const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime')
    const { getAWSCredentials } = require('../lib/aws-config')
    
    const credentials = await getAWSCredentials()
    const client = new BedrockRuntimeClient({
      region: credentials.region,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey
      }
    })

    const payload = {
      messages: [{
        role: 'user',
        content: [{ text: prompt }]
      }],
      inferenceConfig: {
        maxTokens: 200,
        temperature: 0.7,
        topP: 0.9
      }
    }

    const command = new InvokeModelCommand({
      modelId: 'amazon.nova-micro-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload)
    })

    const response = await client.send(command)
    const responseBody = JSON.parse(new TextDecoder().decode(response.body))
    const insight = responseBody.output?.message?.content?.[0]?.text || 'Your students are showing consistent engagement patterns.'

    logger.info('Daily insight generated', {
      requestId: req.id,
      insightLength: insight.length
    })

    res.json({ 
      insight,
      trend: weekOverWeekChange > 3 ? 'improving' : weekOverWeekChange < -3 ? 'declining' : 'stable',
      requestId: req.id
    })
  } catch (err) {
    logger.error('Bedrock daily insight failed', {
      requestId: req.id,
      error: err.message
    })
    
    // Fallback insight based on data
    let insight = ''
    if (avgEngagement >= 75) {
      insight = `Excellent work! Your ${activeClass} maintains ${avgEngagement}% engagement. Students are ${mostCommonEmotion} and actively participating. Keep up the interactive teaching methods.`
    } else if (avgEngagement >= 50) {
      insight = `Your ${activeClass} shows ${avgEngagement}% engagement with ${mostCommonEmotion} emotions. Consider adding more interactive elements to boost participation during mid-session lulls.`
    } else {
      insight = `Engagement at ${avgEngagement}% needs attention in ${activeClass}. Students appear ${mostCommonEmotion}. Try shorter lecture segments with frequent check-ins and hands-on activities.`
    }
    
    res.json({ 
      insight,
      trend: weekOverWeekChange > 3 ? 'improving' : weekOverWeekChange < -3 ? 'declining' : 'stable',
      requestId: req.id
    })
  }
}))

router.post('/live', asyncHandler(async (req, res) => {
  const logger = getLogger()
  
  try {
    const { emotions, subject, durationMinutes } = req.body
    const insight = await generateInsight(emotions, subject, durationMinutes || 0)
    
    logger.info('Live insight generated', {
      requestId: req.id,
      subject
    })
    
    res.json(insight)
  } catch (err) {
    logger.error('Bedrock live insight failed', {
      requestId: req.id,
      error: err.message
    })
    
    // Fallback so frontend never breaks
    res.json({
      insight: 'Class engagement is being monitored.',
      action: 'Continue monitoring student responses.',
      trend: 'stable',
      requestId: req.id
    })
  }
}))

router.post('/weekly', asyncHandler(async (req, res) => {
  const logger = getLogger()
  
  try {
    const { sessions } = req.body
    const summary = await generateWeeklySummary(sessions)
    
    logger.info('Weekly summary generated', {
      requestId: req.id,
      sessionCount: sessions?.length
    })
    
    res.json({ summary, requestId: req.id })
  } catch (err) {
    logger.error('Weekly summary failed', {
      requestId: req.id,
      error: err.message
    })
    
    res.json({ 
      summary: 'Weekly analysis unavailable. Check your session history for details.',
      requestId: req.id
    })
  }
}))

module.exports = router
