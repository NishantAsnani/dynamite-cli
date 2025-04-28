const {
    DynamoDBClient
  } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

  
const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_KEY,
      secretAccessKey:process.env.AWS_SECRET_KEY,
    },
  });

const docClient=DynamoDBDocumentClient.from(client);


module.exports={
    client,
    docClient
}