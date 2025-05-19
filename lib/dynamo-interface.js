const {
  CreateTableCommand,
  DescribeTableCommand,
  DeleteTableCommand,
} = require("@aws-sdk/client-dynamodb");
const { client, docClient } = require("../db");
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
      process.exit(1);
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
        logger.error(`⚠️ Table ${tableName} does not exist.`);
        process.exit(1)
      }
      const command = new DeleteTableCommand(deleteParams);
      await client.send(command);
    } catch (err) {
      console.log(err)
      logger.error("Error removing name", err);
    }
  },

  addData: async (tableName, data) => {
    try {
      const tableExists = await checkTableExists(tableName);

      if (!tableExists) {
        logger.warn(`⚠️ Table ${tableName} does not exists.`);
        process.exit(1);
      }

      

      if(typeof data==='object' &&!data[0]){
        const addParams = {
          TableName: tableName,
          Item: data,
        };
        const command = new PutCommand(addParams);
        await docClient.send(command);
      }

      
      else if(Array.isArray(data)){
        for (let i = 0; i < data.length; i++) {
          const item = data[i];
          if ( typeof(item) !== "object") {
            logger.error(`Element at index ${i} is not a valid object.`);
            process.exit(1)
          }
        }

        for (let item of data) {
          const addParams = {
          TableName: tableName,
          Item: item,
        };
        const command = new PutCommand(addParams);
        await docClient.send(command);
        }
      }
      else{
        logger.error(`The type of data should either be object or array of objects ${typeof(data)} datatype is not allowed`)
        process.exit(1);
      }

    

    } catch (err) {
      logger.error("Error populating table", err);
    }
  },
};

module.exports = { dynamoInterface };
