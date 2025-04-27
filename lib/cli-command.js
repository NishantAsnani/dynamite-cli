const { program } = require("commander");
const { createFolder, createMigration } = require("./file-utils");
const path=require('path');
const {CONSTANTS}=require('../constants')
const {exec}=require('child_process')


function createMigrationFiles() {
  program
    .command("create-file")
    .description("Create file")
    .requiredOption("--name <name>", "Specify the name of table")
    .requiredOption(
      "--partitionKey <partitionKey>",
      "Partition key with type, e.g., PartitionKey:S"
    )
    .option("--sortKey <sortKey>", "Sort key with type, e.g., SortKey:N")
    .action((options) => {
      const fileName = options.name;
      const { partitionKey, sortKey } = options;
      const [partitionKeyName, partitionKeyType = "N"] = partitionKey.split(':');
      const [sortKeyName, sortKeyType = "N"] = sortKey ? sortKey.split(':') : [null, "N"];
      const migrationName = fileName.endsWith(".js")
        ? fileName
        : `${fileName}.js`;
      const finalName = `${Date.now()}-${migrationName}`;
      createMigration(
        fileName,
        finalName,
        partitionKeyName,
        partitionKeyType,
        sortKeyName,
        sortKeyType
      );
    });
  
}

function runMigrationFile(){
  program
  .command('run')
  .description("Run a specific or all migration files.")
  .option('--name <name>',"Name of migration to be run")
  .action((option)=>{
    const fileName=option.name
    const migrationfilePath=path.join(__dirname,`../${CONSTANTS.MIGRATIONS}`,fileName)

    exec(`node ${migrationfilePath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error executing migration file ${migrationfilePath}:`, error);
        return;
      }
      if (stderr) {
        console.error(`❌ Standard error: ${stderr}`);
        return;
      }
      console.log(`✅ Migration executed successfully: \n${stdout}`);
    });
  




  })

}

module.exports = {
  createMigrationFiles,
  runMigrationFile
};
