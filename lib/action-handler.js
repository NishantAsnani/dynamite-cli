const {
  createMigration,
  runMigration,
  undoMigration,
  createSeeder
} = require("./file-utils");
const path = require("path");
const { CONSTANTS } = require("../constants");

async function handleCreateMigration(options) {
  try {
    const tableName = options.name;
    const isSeederFile = options.seed;
    const migrationName = tableName.endsWith(".js")
      ? tableName
      : `${tableName}.js`;
    const finalName = isSeederFile
      ? `${Date.now()}-${CONSTANTS.SEEDERS}-${migrationName}`
      : `${Date.now()}-create-table-${migrationName}`;

    if (!isSeederFile && !partitionKey) {
      console.log("Partition key is required for creating table");
    }

    if (!isSeederFile) {
      const { partitionKey, sortKey } = options;
      const [partitionKeyName, partitionKeyType = "N"] =
        partitionKey.split(":");
      const [sortKeyName, sortKeyType = "N"] = sortKey
        ? sortKey.split(":")
        : [null, "N"];

      await createMigration(
        tableName,
        finalName,
        partitionKeyName,
        partitionKeyType,
        sortKeyName,
        sortKeyType
      );
    } else {

      await createSeeder(finalName);
    }

    return true;
  } catch (err) {
    return false;
  }
}

async function handleRunMigration(options) {
  try {
    const fileName = options.name;
    const isSeederFile=fileName.split('-')[1]==CONSTANTS.SEEDERS

    
    const folderName=isSeederFile?CONSTANTS.SEEDERS:CONSTANTS.MIGRATIONS
    const migrationfilePath = fileName
      ? path.join(__dirname, `../${folderName}`, fileName)
      : null;
    
    await runMigration(migrationfilePath, fileName,isSeederFile);
  } catch (err) {
    return false;
  }
}

async function handleUndoMigration(options) {
  try {
    const fileName = options.name;
    const allFlag = options.all;
    const migrationfilePath = fileName
      ? path.join(__dirname, `../${CONSTANTS.MIGRATIONS}`, fileName)
      : null;

    await undoMigration(fileName, allFlag, migrationfilePath);
  } catch (err) {
    return false;
  }
}

module.exports = {
  handleCreateMigration,
  handleRunMigration,
  handleUndoMigration,
};
