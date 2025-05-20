#!/usr/bin/env node
const { program } = require("commander");
require("dotenv").config();
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

const { docClient } = require("./db");

checkEnvVars()


    
async function main(){
  try {
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