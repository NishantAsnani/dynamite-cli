const { program } = require("commander");

const path=require('path');
const {CONSTANTS}=require('../constants')
const {handleCreateMigration,handleRunMigration}=require('./action-handler')

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
    .action(async (options) => await handleCreateMigration(options));
  
}

function runMigrationFile(){
  program
  .command('run')
  .description("Run a specific or all migration files.")
  .option('--name <name>',"Name of migration to be run")
  .action( async (option)=>await handleRunMigration(option))

}

module.exports = {
  createMigrationFiles,
  runMigrationFile
};
