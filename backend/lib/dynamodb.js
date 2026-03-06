const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand,
        GetCommand, QueryCommand, UpdateCommand, ScanCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { getAWSCredentials } = require('./aws-config');
const { getLogger } = require('./logger');

let docClient = null;

async function getDocClient() {
  if (docClient) return docClient;
  
  const logger = getLogger();
  const creds = await getAWSCredentials();
  
  const client = new DynamoDBClient({
    region: creds.region,
    credentials: {
      accessKeyId: creds.accessKeyId,
      secretAccessKey: creds.secretAccessKey
    }
  });
  
  docClient = DynamoDBDocumentClient.from(client, {
    marshallOptions: {
      removeUndefinedValues: true,
      convertEmptyValues: false
    }
  });
  
  logger.info('DynamoDB client initialized');
  return docClient;
}

module.exports = { getDocClient, PutCommand, GetCommand, QueryCommand, UpdateCommand, ScanCommand, DeleteCommand };
