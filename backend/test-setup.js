require('dotenv').config();
const { getAWSCredentials } = require('../backend/lib/aws-config');
const { getLogger } = require('../backend/lib/logger');

async function testSetup() {
  console.log('\n🧪 Testing Vibelytics Setup\n' + '='.repeat(60));
  
  const logger = getLogger();
  let allPassed = true;
  
  try {
    // Test 1: AWS Credentials
    console.log('\n1️⃣  Testing AWS Credentials...');
    const creds = await getAWSCredentials();
    console.log('✅ AWS credentials loaded successfully');
    console.log(`   Region: ${creds.region}`);
    console.log(`   Access Key: ${creds.accessKeyId.slice(0, 8)}...`);
    
    // Test 2: Logger
    console.log('\n2️⃣  Testing Logger...');
    logger.info('Test log message from setup script');
    console.log('✅ Logger initialized successfully');
    
    // Test 3: DynamoDB Connection
    console.log('\n3️⃣  Testing DynamoDB Connection...');
    const { getDocClient, ScanCommand } = require('../backend/lib/dynamodb');
    const docClient = await getDocClient();
    
    try {
      await docClient.send(new ScanCommand({
        TableName: 'vibelytics-sessions',
        Limit: 1
      }));
      console.log('✅ DynamoDB connection successful');
      console.log('   Table: vibelytics-sessions');
    } catch (dbErr) {
      if (dbErr.name === 'ResourceNotFoundException') {
        console.log('⚠️  DynamoDB tables not found');
        console.log('   Run: npm run setup');
        allPassed = false;
      } else {
        throw dbErr;
      }
    }
    
    // Test 4: Rekognition
    console.log('\n4️⃣  Testing Rekognition API...');
    const { RekognitionClient, DetectLabelsCommand } = require('@aws-sdk/client-rekognition');
    const rekognition = new RekognitionClient({
      region: creds.region,
      credentials: {
        accessKeyId: creds.accessKeyId,
        secretAccessKey: creds.secretAccessKey
      }
    });
    
    // Test with a simple 1x1 pixel image
    const testImage = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    
    await rekognition.send(new DetectLabelsCommand({
      Image: { Bytes: testImage },
      MaxLabels: 1
    }));
    console.log('✅ Rekognition API accessible');
    
    // Test 5: Bedrock
    console.log('\n5️⃣  Testing Bedrock API...');
    const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
    const bedrock = new BedrockRuntimeClient({
      region: creds.region,
      credentials: {
        accessKeyId: creds.accessKeyId,
        secretAccessKey: creds.secretAccessKey
      }
    });
    
    try {
      await bedrock.send(new InvokeModelCommand({
        modelId: 'amazon.nova-micro-v1:0',
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          messages: [{ role: 'user', content: [{ text: 'Hello' }] }],
          inferenceConfig: { maxTokens: 10 }
        })
      }));
      console.log('✅ Bedrock API accessible');
      console.log('   Model: amazon.nova-micro-v1:0');
    } catch (bedrockErr) {
      if (bedrockErr.name === 'AccessDeniedException') {
        console.log('⚠️  Bedrock model access not enabled');
        console.log('   Enable at: AWS Console → Bedrock → Model Access');
        allPassed = false;
      } else {
        throw bedrockErr;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    
    if (allPassed) {
      console.log('✅ All tests passed! System is ready to start.\n');
      console.log('Run: npm run dev\n');
    } else {
      console.log('⚠️  Some tests failed. Please fix the issues above.\n');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check AWS credentials in .env file');
    console.error('2. Verify IAM permissions for your AWS user');
    console.error('3. Ensure DynamoDB tables exist (run: npm run setup)');
    console.error('4. Check AWS region configuration');
    console.error('5. Enable Bedrock model access in AWS Console\n');
    
    if (error.stack) {
      console.error('\nFull error:');
      console.error(error.stack);
    }
    
    process.exit(1);
  }
}

testSetup();
