const {
    DynamoDBClient
  } = require("@aws-sdk/client-dynamodb");


  
const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_KEY,
      secretAccessKey:process.env.AWS_SECRET_KEY,
    },
  });


module.exports={
    client
}