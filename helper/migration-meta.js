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
const {logger}=require('../helper/logger');
const {STATUS}=require('../constants')
const fs=require('fs').promises

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
        continue;
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
    logger.error("Error adding name", err);
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

async function checkTableExecutionStatus(migrationName,isSeederFile) {
  const fileType=isSeederFile?CONSTANTS.SEEDERS:CONSTANTS.MIGRATIONS;
  try {
    const recordName=constructRecordName(migrationName);
    const tableExist = await checkMigrationExists(recordName);
    const migrationExistsInFolder=await filePresentinFolder(migrationName,isSeederFile);

    if(!migrationExistsInFolder){
      return {isSuccess:false,status:STATUS.NOT_EXISTS,msg:`${fileType} file ${migrationName} does not exist`}
    }

    if (tableExist.Count >=1) {
      return {isSuccess:true,status:STATUS.FOUND,msg:`${fileType} file ${migrationName} exist`}
    }
    else{

      if(!migrationExistsInFolder){
        return {isSuccess:false,status:STATUS.NOT_EXISTS,msg:`${fileType} file ${migrationName} does not exist`}
      }
      else{
        return {isSuccess:false,status:STATUS.NOT_FOUND,msg:`${fileType} file ${migrationName} has not run`}
      }


      
    }
  } catch (err) {
    if (err.name == "ResourceNotFoundException") {
      logger.error(`This ${fileType} file does not exist`)
    } else {
      logger.error("Cannot Check Status of migration provided ", err);
    }
    return {isSuccess:false,status:STATUS.ERROR,msg:`Internal server error`}
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

async function filePresentinFolder(fileName,isSeederFile) {
  try {
    const folderName=isSeederFile?CONSTANTS.SEEDERS:CONSTANTS.MIGRATIONS
    const fileList = await fs.readdir(folderName, {
      withFileTypes: true,
    });

    

    const recordName = constructRecordName(fileName);

    const isFilePresent = fileList
      .filter((dirent) => dirent.isFile())
      .find((file) => file.name == recordName);

    return isFilePresent;
  } catch (err) {
    if (err.code == 'ENOENT') {
      return false
    }
    logger.error(err);
  }
}




module.exports = {
  createMetaDataTable,
  addTableName,
  deleteTableName,
  checkTableExecutionStatus,
  fetchAllMigrationNames,
  constructRecordName,
  filePresentinFolder
};
