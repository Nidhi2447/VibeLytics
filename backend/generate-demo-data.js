const { getDocClient, PutCommand } = require('./lib/dynamodb');
const { v4: uuidv4 } = require('uuid');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const { getAWSCredentials } = require('./lib/aws-config');
require('dotenv').config(); // Load .env file

const SUBJECTS = [
  'Introduction to Algebra',
  'World History',
  'Biology Basics',
  'English Literature',
  'Chemistry Fundamentals',
  'Physics 101',
  'Geography',
  'Computer Science'
];

const EMOTIONS = ['happy', 'calm', 'confused', 'sad'];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateEmotionSummary() {
  const happy = randomInt(30, 60);
  const calm = randomInt(20, 40);
  const confused = randomInt(5, 20);
  const sad = randomInt(0, 10);
  
  const total = happy + calm + confused + sad;
  return {
    happy: Math.round((happy / total) * 100),
    calm: Math.round((calm / total) * 100),
    confused: Math.round((confused / total) * 100),
    sad: Math.round((sad / total) * 100)
  };
}

function getPeakEmotion(emotionSummary) {
  return Object.entries(emotionSummary)
    .sort((a, b) => b[1] - a[1])[0][0];
}

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

async function generateAISummary(sessionData) {
  const { subject, avgEngagement, emotionSummary, durationMinutes, totalStudents } = sessionData;
  
  const prompt = `You are an AI teaching assistant. Write a brief 2-sentence summary for this classroom session.

Session: ${subject}, ${durationMinutes} min, ${totalStudents} students
Engagement: ${avgEngagement}%
Emotions: Happy ${emotionSummary.happy}%, Calm ${emotionSummary.calm}%, Confused ${emotionSummary.confused}%, Sad ${emotionSummary.sad}%

Provide actionable insights in 2 sentences. Be concise and helpful.`;

  try {
    const bedrock = await getBedrockClient();
    
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
          maxTokens: 150,
          temperature: 0.7,
          topP: 0.9
        }
      })
    });

    const response = await bedrock.send(command);
    const body = JSON.parse(new TextDecoder().decode(response.body));
    const summary = body.output.message.content[0].text.trim();
    
    return summary;
  } catch (error) {
    console.warn('Failed to generate AI summary:', error.message);
    // Fallback summary
    if (avgEngagement < 45) {
      return `Low engagement (${avgEngagement}%). High confusion detected. Consider reviewing teaching methods and adding interactive elements.`;
    } else if (avgEngagement < 70) {
      return `Moderate engagement (${avgEngagement}%). Some students showed confusion. Review key concepts for clarity.`;
    } else {
      return `Strong engagement (${avgEngagement}%). Students were attentive and responsive throughout the session.`;
    }
  }
}

async function generateDemoSessions() {
  console.log('🎨 Generating demo data for Vibelytics...\n');
  
  const docClient = await getDocClient();
  const teacherId = 'teacher-001';
  const sessionsToCreate = 15;
  const lowEngagementSessions = 5; // Number of low engagement sessions
  
  for (let i = 0; i < sessionsToCreate; i++) {
    const daysAgo = Math.floor(i / 2); // 2 sessions per day
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);
    startDate.setHours(randomInt(8, 15), randomInt(0, 59), 0, 0);
    
    const durationMinutes = randomInt(30, 90);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    
    const emotionSummary = generateEmotionSummary();
    
    // Create low engagement sessions for the first 5
    const isLowEngagement = i < lowEngagementSessions;
    const avgEngagement = isLowEngagement 
      ? randomInt(25, 44) // Low engagement: 25-44%
      : randomInt(55, 95); // Normal engagement: 55-95%
    
    const peakEmotion = getPeakEmotion(emotionSummary);
    const subject = SUBJECTS[randomInt(0, SUBJECTS.length - 1)];
    
    // Adjust emotion summary for low engagement sessions
    const finalEmotionSummary = isLowEngagement ? {
      happy: randomInt(10, 25),
      calm: randomInt(15, 30),
      confused: randomInt(25, 40),
      sad: randomInt(10, 25)
    } : emotionSummary;
    
    // Generate AI summary
    const summary = await generateAISummary({
      subject,
      avgEngagement,
      emotionSummary: finalEmotionSummary,
      durationMinutes,
      totalStudents: randomInt(20, 35)
    });
    
    const session = {
      teacherId,
      sessionId: uuidv4(),
      subject,
      sectionName: 'Section 10-B',
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      status: 'ended',
      avgEngagement,
      emotionSummary: finalEmotionSummary,
      peakEmotion: isLowEngagement ? (finalEmotionSummary.confused > finalEmotionSummary.sad ? 'confused' : 'sad') : peakEmotion,
      totalStudentsDetected: randomInt(20, 35),
      summary
    };
    
    await docClient.send(new PutCommand({
      TableName: 'vibelytics-sessions',
      Item: session
    }));
    
    const engagementLabel = isLowEngagement ? '⚠️  LOW' : '✅';
    console.log(`${engagementLabel} Created session ${i + 1}/${sessionsToCreate}: ${subject} (${avgEngagement}% engagement)`);
  }
  
  console.log('\n🎉 Demo data generation complete!');
  console.log(`\n📊 Created ${sessionsToCreate} sessions for teacher-001`);
  console.log(`   - ${lowEngagementSessions} low engagement sessions (25-44%)`);
  console.log(`   - ${sessionsToCreate - lowEngagementSessions} normal/high engagement sessions (55-95%)`);
  console.log('🔗 View at: http://localhost:5173/reports\n');
}

generateDemoSessions()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Error generating demo data:', err);
    process.exit(1);
  });
