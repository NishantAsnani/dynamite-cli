const {
  CreateTableCommand,
  DescribeTableCommand,
  DeleteTableCommand,
} = require("@aws-sdk/client-dynamodb");
const { client,docClient } = require("../db");
const { PutCommand } = require("@aws-sdk/lib-dynamodb");
const { logger } = require("../helper/logger");


async function checkTableExists(tableName) {
  try {
    const describeParams = { TableName: tableName };
    await client.send(new DescribeTableCommand(describeParams));
    return true;
  } catch (err) {
    if (err.name === "ResourceNotFoundException") {
      return false;
    }
    throw err;
  }
}

const dynamoInterface = {
  createTable: async (tableName, partitionObject, sortObject) => {
    const partitionKeyName = partitionObject?.name;
    const partitionKeyType = partitionObject?.type;
    const sortKeyName = sortObject?.name ? sortObject?.name : undefined;
    const sortKeyType = sortObject?.sortKeyType
      ? sortObject?.sortKeyType
      : undefined;

    const tableExists = await checkTableExists(tableName);

    if (tableExists) {
      logger.warn(`⚠️ Table ${tableName} already exists.`);
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
        createParams.AttributeDefinitions.push({
          AttributeName: sortKeyName,
          AttributeType: sortKeyType,
        });
        createParams.KeySchema.push({
          AttributeName: sortKeyName,
          KeyType: "RANGE",
        });
      }

      const command = new CreateTableCommand(createParams);
      const response = await client.send(command);
    } catch (err) {
      logger.error(" Error while creating table:", err);
    }
  },

  dropTable: async (tableName) => {
    try {
      const deleteParams = {
        TableName: tableName,
      };
      const tableExists = await checkTableExists(tableName);

      if (!tableExists) {
        console.log(`⚠️ Table ${tableName} does not exist.`);
        return;
      }
      const command = new DeleteTableCommand(deleteParams);
      await client.send(command);
    } catch (err) {
      logger.error("Error adding name", err);
    }
  },

  addData:async (tableName,data)=>{
    try{

    const tableExists = await checkTableExists(tableName);

    if (!tableExists) {
      logger.warn(`⚠️ Table ${tableName} does not exists.`);
      return;
    }
      const items = Array.isArray(data) ? data : [data];

      for (const item of items) {
        const addParams = {
          TableName: tableName,
          Item: item,
        };

        const command = new PutCommand(addParams);
        await docClient.send(command);
      }
    }catch(err){
      logger.error("Error populating table",err)
    }

  }
};

module.exports = { dynamoInterface };
