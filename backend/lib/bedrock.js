const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const { getAWSCredentials } = require('./aws-config');
const { getLogger } = require('./logger');

let bedrockClient = null;

async function getBedrockClient() {
  if (bedrockClient) return bedrockClient;
  
  const creds = await getAWSCredentials();
  bedrockClient = new BedrockRuntimeClient({
    region: creds.region,
    credentials: {
      accessKeyId: creds.accessKeyId,
      secretAccessKey: creds.secretAccessKey
    }
  });
  
  return bedrockClient;
}

// Amazon Nova uses a messages-style body but with nested content arrays
async function callNova(prompt, maxTokens = 300) {
  const logger = getLogger();
  const startTime = Date.now();
  
  try {
    const bedrock = await getBedrockClient();
    
    logger.info('Calling Bedrock Nova API', {
      promptLength: prompt.length,
      maxTokens
    });
    
    const command = new InvokeModelCommand({
      modelId: 'amazon.nova-micro-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: [{ text: prompt }]
          }
        ],
        inferenceConfig: {
          maxTokens,
          temperature: 0.7,
          topP: 0.9
        }
      })
    });

    const response = await bedrock.send(command);
    const body = JSON.parse(new TextDecoder().decode(response.body));
    const result = body.output.message.content[0].text.trim();
    
    const duration = Date.now() - startTime;
    logger.info('Bedrock API call completed', {
      duration: `${duration}ms`,
      responseLength: result.length
    });
    
    return result;
  } catch (error) {
    logger.error('Bedrock API error', {
      error: error.message,
      code: error.code
    });
    throw error;
  }
}

async function generateInsight(emotions, subject, durationMinutes) {
  const prompt = `You are a classroom analytics AI assistant.

Current class emotion data:
- Happy/Engaged: ${emotions.happy || 0}%
- Calm/Neutral: ${emotions.calm || 0}%
- Confused: ${emotions.confused || 0}%
- Sad/Disengaged: ${emotions.sad || 0}%
- Subject: ${subject}
- Session duration so far: ${durationMinutes} minutes

Respond ONLY with a valid JSON object, no markdown, no extra text:
{"insight":"one sentence describing current class state","action":"one specific thing teacher should do right now","trend":"improving"}`

  try {
    const text = await callNova(prompt, 250)

    // Extract JSON safely in case Nova adds preamble text
    const jsonStart = text.indexOf('{')
    const jsonEnd = text.lastIndexOf('}')
    if (jsonStart !== -1 && jsonEnd !== -1) {
      return JSON.parse(text.substring(jsonStart, jsonEnd + 1))
    }
    return { insight: text, action: '', trend: 'stable' }
  } catch (err) {
    console.error('[Nova insight error]', err.message)
    // Smart local fallback — app never crashes
    const engagement = (emotions.happy || 0) + (emotions.calm || 0)
    if ((emotions.confused || 0) > 20) {
      return {
        insight: `High confusion detected in ${subject}. Around ${emotions.confused}% appear confused.`,
        action: 'Pause and ask students to share their doubts or do a quick 2-minute recap.',
        trend: 'declining'
      }
    } else if (engagement < 50) {
      return {
        insight: `Engagement is dropping in ${subject} — currently at ${engagement}%.`,
        action: 'Try a quick poll, question, or short activity to re-energize the class.',
        trend: 'declining'
      }
    }
    return {
      insight: `Class is engaged and progressing well in ${subject}.`,
      action: 'Keep up the current pace and do a quick check-in with students.',
      trend: 'stable'
    }
  }
}

async function generateWeeklySummary(sessions) {
  if (!sessions || sessions.length === 0) {
    return 'No sessions recorded yet. Start your first session to begin tracking engagement.'
  }

  const sessionSummary = sessions.map(s =>
    `${s.subject} (${s.date}): ${s.avgVibe || 0}% engagement, duration ${s.duration}`
  ).join('\n')

  const prompt = `You are a classroom analytics AI for a teacher dashboard.
Here are this week's teaching sessions:
${sessionSummary}

Write a 2-3 sentence weekly summary for the teacher. Mention the best session, any patterns, and one practical improvement tip.
Plain text only — no bullet points, no JSON, no markdown.`

  try {
    return await callNova(prompt, 300)
  } catch (err) {
    console.error('[Nova summary error]', err.message)
    // Local fallback summary from real data
    const avg = Math.round(sessions.reduce((s, x) => s + (x.avgVibe || 0), 0) / sessions.length)
    const best = sessions.reduce((a, b) => (a.avgVibe || 0) > (b.avgVibe || 0) ? a : b)
    const worst = sessions.reduce((a, b) => (a.avgVibe || 0) < (b.avgVibe || 0) ? a : b)
    return `You completed ${sessions.length} session${sessions.length > 1 ? 's' : ''} with an average engagement of ${avg}%. ` +
      `Your strongest session was ${best.subject} with ${Math.round(best.avgVibe || 0)}% engagement. ` +
      ((worst.avgVibe || 0) < 60
        ? `Consider revisiting ${worst.subject} — it had the lowest engagement at ${Math.round(worst.avgVibe || 0)}%.`
        : 'Overall engagement was consistently strong across all sessions.')
  }
}

module.exports = { generateInsight, generateWeeklySummary }
