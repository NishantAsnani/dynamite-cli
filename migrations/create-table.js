const { CreateTableCommand,DescribeTableCommand } = require("@aws-sdk/client-dynamodb");

const { client } = require("../db");

async function checkTableExists(tableName) {
  try {
    const describeParams = { TableName: tableName };
    await client.send(new DescribeTableCommand(describeParams));
    return true; // Table exists
  } catch (err) {
    if (err.name === "ResourceNotFoundException") {
      return false; // Table does not exist
    }
    throw err; // Other errors, like permissions or network issues
  }
}

async function createTable() {
  const tableName = "demo-table";

  const tableExists = await checkTableExists(tableName);

  if (tableExists) {
    console.log(`⚠️ Table "${tableName}" already exists.`);
    return;
  }

  try {
    const createParams = {
      TableName: tableName,
      AttributeDefinitions: [{ AttributeName: "id", AttributeType: "N" }],
      KeySchema: [
        {
          AttributeName: "id",
          KeyType: "HASH",
        },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    };

    const command = new CreateTableCommand(createParams);
    const response = await client.send(command);
    console.log("✅ Table created successfully!");
  } catch (err) {
    console.error("❌ Error while creating table:", err);
  }
}

module.exports = {
  createTable,
};
