const { program } = require("commander");
const {  createMigration } = require("./file-utils");
const path=require('path');
const {CONSTANTS}=require('../constants')
const {runMigration}=require('./file-utils')


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
    .action(async (options) => {
      const fileName = options.name;
      const { partitionKey, sortKey } = options;
      const [partitionKeyName, partitionKeyType = "N"] = partitionKey.split(':');
      const [sortKeyName, sortKeyType = "N"] = sortKey ? sortKey.split(':') : [null, "N"];
      const migrationName = fileName.endsWith(".js")
        ? fileName
        : `${fileName}.js`;
      const finalName = `${Date.now()}-${migrationName}`;
      await createMigration(
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
  .action( async (option)=>{
    const fileName=option.name
    const migrationfilePath=path.join(__dirname,`../${CONSTANTS.MIGRATIONS}`,fileName)

    await runMigration(migrationfilePath,fileName)


    
  




  })

}

module.exports = {
  createMigrationFiles,
  runMigrationFile
};
