const { getDocClient, ScanCommand, DeleteCommand } = require('./lib/dynamodb');
require('dotenv').config();

async function clearDemoData() {
  console.log('🗑️  Clearing demo data from Vibelytics...\n');
  
  const docClient = await getDocClient();
  const teacherId = 'teacher-001';
  
  // Scan for all sessions for this teacher
  const scanResult = await docClient.send(new ScanCommand({
    TableName: 'vibelytics-sessions',
    FilterExpression: 'teacherId = :tid',
    ExpressionAttributeValues: {
      ':tid': teacherId
    }
  }));
  
  const sessions = scanResult.Items || [];
  console.log(`📊 Found ${sessions.length} sessions to delete\n`);
  
  // Delete each session
  for (const session of sessions) {
    await docClient.send(new DeleteCommand({
      TableName: 'vibelytics-sessions',
      Key: {
        teacherId: session.teacherId,
        sessionId: session.sessionId
      }
    }));
    console.log(`✅ Deleted session: ${session.subject} (${session.avgEngagement}% engagement)`);
  }
  
  console.log('\n🎉 All demo data cleared!');
  console.log('💡 Run "node generate-demo-data.js" to create fresh data\n');
}

clearDemoData()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Error clearing demo data:', err);
    process.exit(1);
  });
