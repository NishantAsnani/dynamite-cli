const {
  CreateTableCommand,
  DescribeTableCommand,
} = require("@aws-sdk/client-dynamodb");
const { client } = require("../db");

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
  createTable: async (tableName,partitionObject,sortObject) => {

   
    const partitionKeyName = partitionObject?.name;
    const partitionKeyType = partitionObject?.type;
    const sortKeyName = sortObject?.name ? sortObject?.name : undefined;
    const sortKeyType = sortObject?.sortKeyType ? sortObject?.sortKeyType : undefined;


    const tableExists = await checkTableExists(tableName);

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
      console.log("✅ Table created successfully!");
    } catch (err) {
      console.error(" Error while creating table:", err);
    }
  },

  dropTable:async (tableName)=>{
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
};


module.exports={dynamoInterface}