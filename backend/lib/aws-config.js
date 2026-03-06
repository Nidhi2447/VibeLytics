const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

let cachedCredentials = null;

async function getAWSCredentials() {
  if (cachedCredentials) {
    return cachedCredentials;
  }
  
  // Always try environment variables first (for development)
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    console.log('✅ Using credentials from environment variables');
    cachedCredentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1'
    };
    return cachedCredentials;
  }
  
  // Only try Secrets Manager if explicitly configured
  if (process.env.USE_SECRETS_MANAGER === 'true') {
    const client = new SecretsManagerClient({ 
      region: process.env.AWS_REGION || 'us-east-1'
    });
    
    try {
      console.log('🔐 Loading AWS credentials from Secrets Manager...');
      const response = await client.send(new GetSecretValueCommand({
        SecretId: process.env.AWS_SECRET_NAME || 'vibelytics/aws-credentials'
      }));
      
      cachedCredentials = JSON.parse(response.SecretString);
      console.log('✅ AWS credentials loaded from Secrets Manager');
      console.log(`   Region: ${cachedCredentials.region}`);
      console.log(`   Access Key: ${cachedCredentials.accessKeyId.slice(0, 8)}...`);
      
      return cachedCredentials;
    } catch (error) {
      console.error('❌ Failed to load credentials from Secrets Manager:', error.message);
      throw new Error('Cannot load credentials from Secrets Manager');
    }
  }
  
  throw new Error('No AWS credentials available. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env file');
}

module.exports = { getAWSCredentials };
