const { RekognitionClient, DetectFacesCommand } = require('@aws-sdk/client-rekognition');
const { getAWSCredentials } = require('./aws-config');
const { getLogger } = require('./logger');

let rekognitionClient = null;

async function getRekognitionClient() {
  if (rekognitionClient) return rekognitionClient;
  
  const creds = await getAWSCredentials();
  rekognitionClient = new RekognitionClient({
    region: creds.region,
    credentials: {
      accessKeyId: creds.accessKeyId,
      secretAccessKey: creds.secretAccessKey
    }
  });
  
  return rekognitionClient;
}

async function analyzeFrame(imageBase64) {
  const logger = getLogger();
  const startTime = Date.now();
  
  try {
    const rekognition = await getRekognitionClient();
    
    const imageBytes = Buffer.from(
      imageBase64.replace(/^data:image\/\w+;base64,/, ''),
      'base64'
    );

    logger.info('Calling Rekognition DetectFaces API', {
      imageSize: imageBytes.length
    });

    const command = new DetectFacesCommand({
      Image: { Bytes: imageBytes },
      Attributes: ['ALL']
    });

    const result = await rekognition.send(command);
    
    const duration = Date.now() - startTime;
    logger.info('Rekognition API call completed', {
      duration: `${duration}ms`,
      facesDetected: result.FaceDetails?.length || 0
    });
    const faces = result.FaceDetails || [];

    if (faces.length === 0) {
      logger.info('No faces detected in frame');
      return { faces: 0, emotions: { happy: 0, calm: 0, confused: 0, sad: 0 }, engagementScore: 0 };
    }

  const emotionCounts = { happy: 0, calm: 0, confused: 0, sad: 0 }

  faces.forEach(face => {
    const sorted = face.Emotions.sort((a, b) => b.Confidence - a.Confidence)
    const top = sorted[0].Type.toUpperCase()

    if (top === 'HAPPY') emotionCounts.happy++
    else if (['CALM', 'SURPRISED'].includes(top)) emotionCounts.calm++
    else if (['CONFUSED', 'DISGUSTED'].includes(top)) emotionCounts.confused++
    else emotionCounts.sad++ // SAD, FEAR, ANGRY
  })

  const total = faces.length
  const emotions = {
    happy: Math.round((emotionCounts.happy / total) * 100),
    calm: Math.round((emotionCounts.calm / total) * 100),
    confused: Math.round((emotionCounts.confused / total) * 100),
    sad: Math.round((emotionCounts.sad / total) * 100)
  }

    const engagementScore = Math.round(
      (emotions.happy * 1.0) +
      (emotions.calm * 0.7) +
      (emotions.confused * 0.3) +
      (emotions.sad * 0.0)
    );

    logger.info('Frame analysis completed', {
      faces: total,
      engagementScore,
      emotions
    });

    return { faces: total, emotions, engagementScore };
  } catch (error) {
    logger.error('Rekognition API error', {
      error: error.message,
      code: error.code
    });
    throw error;
  }
}

module.exports = { analyzeFrame }
