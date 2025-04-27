const { program } = require("commander");
const { createFolder, createMigration } = require("./file-utils");


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
  program.parse(process.argv);
}

module.exports = {
  createMigrationFiles,
};
