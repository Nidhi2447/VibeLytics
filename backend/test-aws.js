// test-aws.js
require('dotenv').config()
const { RekognitionClient, ListCollectionsCommand } = require('@aws-sdk/client-rekognition')

const client = new RekognitionClient({ region: 'us-east-1' })
client.send(new ListCollectionsCommand({}))
  .then(() => console.log('✅ Rekognition working'))
  .catch(err => console.log('❌ Error:', err.message))