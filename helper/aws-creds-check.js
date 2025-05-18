const { ListTablesCommand } = require("@aws-sdk/client-dynamodb");
const { logger } = require("./logger")


function checkEnvVars() {
  const missing = [];
  if (!process.env.AWS_REGION) missing.push("AWS_REGION");
  if (!process.env.AWS_ACCESS_KEY_ID) missing.push("AWS_ACCESS_KEY_ID");
  if (!process.env.AWS_SECRET_ACCESS_KEY) missing.push("AWS_SECRET_ACCESS_KEY");

  if (missing.length) {
    logger.error(`❌ Missing AWS credentials: ${missing.join(", ")}`);
    logger.info("Please create a .env file and set environment variables.");
    logger.info(`\nExample .env:
AWS_REGION=your-aws-region
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
`);
    process.exit(1);
  }
}

async function validateAWSCredentials(docClient) {
  try {
    await docClient.send(new ListTablesCommand({ Limit: 1 }));
  } catch (err) {
    if (err.name === "CredentialsProviderError" || err.name === "UnrecognizedClientException" || err.name==="InvalidSignatureException") {
      logger.error("❌ Invalid AWS credentials. Please check your access key and secret.");
    } else if (err.name === "UnknownEndpoint") {
      logger.error("❌ Invalid region or network issue.");
    } else {
      logger.error(`❌ AWS error: ${err.message}`);
    }
    process.exit(1);
  }
}
module.exports={checkEnvVars,validateAWSCredentials}
