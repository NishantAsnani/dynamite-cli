const {program}=require('commander');
require('dotenv').config();
const AWS = require("aws-sdk");
const {createTable}=require('./migrations/create-table')
const {runMigrationFile,createMigrationFiles}=require('./lib/cli-command')
// program.command('hello').action(() => {
//     console.log('Hello from Dynamo CLI!');
//   });
// program.parse(process.argv);

AWS.config.update({
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey:process.env.AWS_SECRET_KEY,
  region:process.env.AWS_REGION
});


console.log("App Started.......")


createMigrationFiles()
runMigrationFile()

program.parse(process.argv);

