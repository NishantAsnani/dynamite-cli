const { STSClient, GetCallerIdentityCommand } = require("@aws-sdk/client-sts");

async function hasValidAWSCredentials() {
  try {
    const client = new STSClient();
    await client.send(new GetCallerIdentityCommand());
    return true;
  } catch (err) {
    return false;
  }
}

module.exports = {
  hasValidAWSCredentials,
};
