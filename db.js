const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const { hasValidAWSCredentials } = require("./helper/check-validated-creds");

async function getDynamoClients() {
  const isValidCreds = await hasValidAWSCredentials();
  
  let client;
  if (!isValidCreds) {
    client = new DynamoDBClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  } else {
    client = new DynamoDBClient({
      region: process.env.AWS_REGION
    });
  }

  const docClient = DynamoDBDocumentClient.from(client);

  return { client, docClient };
}

module.exports = getDynamoClients;
