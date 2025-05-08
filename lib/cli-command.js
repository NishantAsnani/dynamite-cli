const { program } = require("commander");
const {
  handleCreateMigration,
  handleRunMigration,
  handleUndoMigration,
  handleCreateSeeder,
  handleRunSeeder,
  handleListStatus
} = require("./action-handler");

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

function createSeederFile(){
  program
    .command("create-seed")
    .description("Create seeder file")
    .requiredOption("--name <name>", "Specify the name of table")
    
    .action(async (options) => await handleCreateSeeder(options));
}

function runMigrationFile() {
  program
    .command("run")
    .description("Run a specific or all migration files.")
    .option("--name <name>", "Name of migration to be run")
    .action(async (option) => await handleRunMigration(option));
}

function runSeederFile() {
  program
    .command("run-seed")
    .description("Run a specific or all migration files.")
    .option("--name <name>", "Name of seeder to be run")
    .option("--force","Force run a named seeder")
    .action(async (option) => await handleRunSeeder(option));
}

function undoMigrationFile() {
  program
    .command("undo")
    .description(
      "Undo a specific migration all migration or latest run migration"
    )
    .option("--name <name>", "Name of migration to be undone")
    .option("--all","Undo all migrations run till now")
    .action(async (option) => await handleUndoMigration(option));
}

function listStatus(){
  program
    .command("list")
    .description(
      "List status of all migrations and seeders"
    )
    .action(async () => await handleListStatus());
}


module.exports = {
  createMigrationFiles,
  runMigrationFile,
  undoMigrationFile,
  createSeederFile,
  runSeederFile,
  listStatus
};
