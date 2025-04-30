const {
  CreateTableCommand,
  DescribeTableCommand,
} = require("@aws-sdk/client-dynamodb");

const { client, docClient } = require("../db");
const { CONSTANTS,STATUS } = require("../constants");
const {
  PutCommand,
  DeleteCommand,
  ScanCommand,
} = require("@aws-sdk/lib-dynamodb");

async function checkTableExists(tableName) {
  try {
    const describeParams = { TableName: tableName };
    const response = await client.send(
      new DescribeTableCommand(describeParams)
    );
    return response; // Table exists
  } catch (err) {
    throw err; // Other errors, like permissions or network issues
  }
}

async function createMetaDataTable() {
  const tableName = CONSTANTS.DYNAMOMETA;

  try {
    const createParams = {
      TableName: tableName,
      AttributeDefinitions: [
        { AttributeName: "tableName", AttributeType: "S" },
      ],
      KeySchema: [
        {
          AttributeName: "tableName",
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

    let isTableActive = false;

    while (!isTableActive) {
      const describeResponse = await client.send(
        new DescribeTableCommand({ TableName: tableName })
      );
      const tableStatus = describeResponse.Table.TableStatus;

      if (tableStatus === "ACTIVE") {
        isTableActive = true;
      } else {
        console.log(`⏳ Table status is ${tableStatus}. Waiting...`);
        await new Promise((resolve) => setTimeout(resolve, 2000)); // wait 2 seconds
      }
    }
    console.log("✅ Table created successfully!");
  } catch (err) {
    if (err.name == "ResourceInUseException") {
      return false;
    } else {
      console.error("❌ Error while creating table:", err);
    }
  }
}

async function addTableName(tableName) {
  try {
    const addParams = {
      TableName: CONSTANTS.DYNAMOMETA,
      Item: {
        tableName: tableName,
      },
    };

    const command = new PutCommand(addParams);
    await docClient.send(command);
  } catch (err) {
    console.log("Error adding name", err);
  }
}

async function deleteTableName(tableName) {
  try {
    const deleteParams = {
      TableName: CONSTANTS.DYNAMOMETA,
      Item: {
        tableName: tableName,
      },
    };

    const command = new DeleteCommand(deleteParams);
    await docClient.send(command);
    console.log("Item inserted successfully!");
  } catch (err) {
    console.log("Error adding name", err);
  }
}

async function checkTableExecutionStatus(tableName) {
  try {
    const tableExist = await checkTableExists(tableName);

    if (tableExist.Table.TableStatus == STATUS.ACTIVE) {
      return true;
    }
  } catch (err) {
    if (err.name == "ResourceNotFoundException") {
      return false;
    } else {
      console.log("Cannot Check Status of migration provided ", err);
    }
  }
}

async function fetchAllMigrationNames() {
  try {
    const params = {
      TableName: CONSTANTS.DYNAMOMETA,
    };

    const command = new ScanCommand(params);
    const result = await docClient.send(command);
    let allActiveMigrations =
      result.Items.map((ele) => ele.tableName + ".js") || [];

    return allActiveMigrations;
  } catch (err) {
    return false;
  }
}

async function createTable(tableName,
  partitionKeyName,
  partitionKeyType,
  sortKeyName,
  sortKeyType) {
  const tableName = tableName;
  const sortKeyName = sortKeyName ? sortKeyName : undefined;
  const sortKeyType = sortKeyType ? sortKeyType :undefined;

  const tableExists = await checkTableExecutionStatus(tableName);

  if (tableExists) {
    console.log(`⚠️ Table ${tableName} already exists.`);
    return;
  }

  try {
    const createParams = {
      TableName: tableName,
      AttributeDefinitions: [
        { AttributeName: partitionKeyName, AttributeType: partitionKeyType },
      ],
      KeySchema: [
        {
          AttributeName: partitionKeyName,
          KeyType: "HASH",
        },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    };

    if (sortKeyName && sortKeyType) {
      createParams.AttributeDefinitions.push({ AttributeName: sortKeyName, AttributeType: sortKeyType });
      createParams.KeySchema.push({
        AttributeName: sortKeyName,
        KeyType: 'RANGE',
      });
    }

    const command = new CreateTableCommand(createParams);
    const response = await client.send(command);
    console.log("✅ Table created successfully!");
  } catch (err) {
    console.error("❌ Error while creating table:", err);
  }
}



module.exports = {
  createMetaDataTable,
  addTableName,
  deleteTableName,
  checkTableExecutionStatus,
  fetchAllMigrationNames,
  createTable
};
