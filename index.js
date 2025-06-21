#!/usr/bin/env node
const { program } = require("commander");
const fs = require('fs');

if (fs.existsSync('.env')) {
  require('dotenv').config();
}

const {
  runMigrationFile,
  createMigrationFiles,
  undoMigrationFile,
  createSeederFile,
  runSeederFile,
  listStatus,
} = require("./lib/cli-command");

const {
  checkEnvVars,
  validateAWSCredentials
}=require("./helper/aws-creds-check")


const {hasValidAWSCredentials}=require('./helper/check-validated-creds')

const getDynamoClients = require("./db");




    
async function main(){
  try {
    const { docClient } = await getDynamoClients();
    const ValidatedCreds=hasValidAWSCredentials()
    await checkEnvVars(ValidatedCreds)
    await validateAWSCredentials(docClient);
  } catch (err) {
    console.error("Failed to initialize CLI:", err);
    process.exit(1);
  }
}

main()
 

createMigrationFiles();
runMigrationFile();
undoMigrationFile();
createSeederFile();
runSeederFile();
listStatus();
program.parse(process.argv);