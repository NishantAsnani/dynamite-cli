#!/usr/bin/env node

const {program}=require('commander');
require('dotenv').config();
const AWS = require("aws-sdk");
const {runMigrationFile,createMigrationFiles,undoMigrationFile,createSeederFile,runSeederFile,listStatus}=require('./lib/cli-command')
const {checkEnvVars,validateAWSCredentials}=require('./helper/aws-creds-check')
const {docClient}=require('./db')

checkEnvVars()

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY,
  region:process.env.AWS_REGION
});

(async () => {
  await validateAWSCredentials(docClient);
})();

console.log("App Started.......")


createMigrationFiles()
runMigrationFile()
undoMigrationFile()
createSeederFile()
runSeederFile()
listStatus()

program.parse(process.argv);

