/**
 * Vibelytics — DynamoDB Table Setup Script
 * Run once: node setup-tables.js
 * This creates all required tables in your AWS account.
 */

require('dotenv').config()
const { DynamoDBClient, CreateTableCommand, DescribeTableCommand, waitUntilTableExists } = require('@aws-sdk/client-dynamodb')

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
})

const tables = [
  {
    TableName: 'vibelytics-sessions',
    KeySchema: [
      { AttributeName: 'teacherId', KeyType: 'HASH' },  // Partition key
      { AttributeName: 'sessionId', KeyType: 'RANGE' }  // Sort key
    ],
    AttributeDefinitions: [
      { AttributeName: 'teacherId', AttributeType: 'S' },
      { AttributeName: 'sessionId', AttributeType: 'S' }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  },
  {
    TableName: 'vibelytics-snapshots',
    KeySchema: [
      { AttributeName: 'sessionId', KeyType: 'HASH' },   // Partition key
      { AttributeName: 'timestamp', KeyType: 'RANGE' }   // Sort key
    ],
    AttributeDefinitions: [
      { AttributeName: 'sessionId', AttributeType: 'S' },
      { AttributeName: 'timestamp', AttributeType: 'S' }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  },
  {
    TableName: 'vibelytics-alerts',
    KeySchema: [
      { AttributeName: 'teacherId', KeyType: 'HASH' },   // Partition key
      { AttributeName: 'alertId', KeyType: 'RANGE' }     // Sort key
    ],
    AttributeDefinitions: [
      { AttributeName: 'teacherId', AttributeType: 'S' },
      { AttributeName: 'alertId', AttributeType: 'S' }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  }
]

async function tableExists(tableName) {
  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }))
    return true
  } catch (err) {
    if (err.name === 'ResourceNotFoundException') return false
    throw err
  }
}

async function setupTables() {
  console.log('\n🚀 Vibelytics — DynamoDB Setup\n' + '='.repeat(40))
  console.log(`Region: ${process.env.AWS_REGION}`)
  console.log(`Access Key: ${process.env.AWS_ACCESS_KEY_ID?.slice(0, 8)}...`)
  console.log('='.repeat(40) + '\n')

  for (const tableConfig of tables) {
    const { TableName } = tableConfig

    const exists = await tableExists(TableName)
    if (exists) {
      console.log(`✅  ${TableName} — already exists, skipping.`)
      continue
    }

    try {
      console.log(`⏳  Creating ${TableName}...`)
      await client.send(new CreateTableCommand(tableConfig))

      // Wait until table is ACTIVE
      await waitUntilTableExists(
        { client, maxWaitTime: 60 },
        { TableName }
      )
      console.log(`✅  ${TableName} — created and ACTIVE!`)
    } catch (err) {
      console.error(`❌  Failed to create ${TableName}:`, err.message)
    }
  }

  console.log('\n' + '='.repeat(40))
  console.log('✅  All tables ready. You can now run: node server.js')
  console.log('='.repeat(40) + '\n')
}

setupTables().catch(err => {
  console.error('\n❌  Setup failed:', err.message)
  console.error('Tip: Check your AWS credentials in the .env file.\n')
  process.exit(1)
})
