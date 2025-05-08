const {
  CreateTableCommand,
  DescribeTableCommand,
  QueryCommand,
} = require("@aws-sdk/client-dynamodb");

const { client, docClient } = require("../db");
const { CONSTANTS } = require("../constants");
const {
  PutCommand,
  DeleteCommand,
  ScanCommand,
} = require("@aws-sdk/lib-dynamodb");

async function checkMigrationExists(fileNameValue) {
  try {
    const findParams={
      TableName:CONSTANTS.DYNAMOMETA,
      KeyConditionExpression: "tableName = :fileNameValue",
      ExpressionAttributeValues: {
        ":fileNameValue":{ S: fileNameValue }, 
      },
    }

    
    const response = await client.send(
      new QueryCommand(findParams)
    );


    return response; 
  } catch (err) {
    throw err; 
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

  } catch (err) {
    if (err.name == "ResourceInUseException") {
      return false;
    } else {
      console.error("❌ Error while creating table:", err);
    }
  }
}

async function addTableName(migrationName) {
  try {

    const recordName=constructRecordName(migrationName)
    const addParams = {
      TableName: CONSTANTS.DYNAMOMETA,
      Item: {
        tableName: recordName,
      },
    };

    const command = new PutCommand(addParams);
    await docClient.send(command);
  } catch (err) {
    console.log("Error adding name", err);
  }
}

async function deleteTableName(migrationName) {
  try {

    const recordName=constructRecordName(migrationName)
    const deleteParams = {
      TableName: CONSTANTS.DYNAMOMETA,
      Key: {
        tableName: recordName,
      },
    };


    const command = new DeleteCommand(deleteParams);
    await docClient.send(command);
  } catch (err) {
    console.log("Error adding name", err);
  }
}

async function checkTableExecutionStatus(migrationName) {
  try {
    const recordName=constructRecordName(migrationName)
    const tableExist = await checkMigrationExists(recordName);

    if (tableExist.Count >=1) {
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
      result.Items.map((ele) => ele.tableName) || [];

    return allActiveMigrations;
  } catch (err) {
    return false;
  }
}


function constructRecordName(fileName){
  try{
    const recordName = fileName.endsWith(".js")
    ? fileName
    : `${fileName}.js`;

    return recordName;
  }catch(err){
    return false
  }
}





module.exports = {
  createMetaDataTable,
  addTableName,
  deleteTableName,
  checkTableExecutionStatus,
  fetchAllMigrationNames,
  constructRecordName
};
