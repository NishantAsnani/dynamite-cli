const {program}=require('commander');
require('dotenv').config();
const AWS = require("aws-sdk");
const {runMigrationFile,createMigrationFiles,undoMigrationFile,createSeederFile,runSeederFile,listStatus}=require('./lib/cli-command')
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
undoMigrationFile()
createSeederFile()
runSeederFile()
listStatus()

program.parse(process.argv);

