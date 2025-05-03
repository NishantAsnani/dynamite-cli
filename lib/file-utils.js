const fs = require("fs").promises;
const path = require("path");
const { CONSTANTS } = require("../constants");
const { createSkeletalMigration } = require("../skeleton-file");
const {
  createMetaDataTable,
  addTableName,
  deleteTableName,
  checkTableExecutionStatus,
  fetchAllMigrationNames,
} = require("../helper/migration-meta");
const { dynamoInterface } = require("./dynamo-interface");

async function createFolder(folderName) {
  try {
    const folderPath = path.join(__dirname, `../${folderName}`);
    await fs.mkdir(folderPath, { recursive: true });
  } catch (err) {
    console.log(err);
  }
}

async function createMigration(
  tableName,
  fileName,
  partitionKeyName,
  partitionKeyType,
  sortKeyName,
  sortKeyType
) {
  try {
    const folderPath = path.join(__dirname, `../${CONSTANTS.MIGRATIONS}`);
    const filePath = path.join(folderPath, fileName);

    try {
      const stats = await fs.stat(folderPath);
      if (!stats.isDirectory()) {
        console.log("Path exists but is not a folder.");
        return;
      }
    } catch (err) {
      if (err.code === "ENOENT") {
        console.log("Folder does not exist, creating...");
        await createFolder(CONSTANTS.MIGRATIONS);
        await createMetaDataTable();
      } else {
        throw err;
      }
    }

    const skeletalFile = createSkeletalMigration(
      tableName,
      partitionKeyName,
      partitionKeyType,
      sortKeyName,
      sortKeyType
    );

    await fs.writeFile(filePath, skeletalFile);
    console.log("File created successfully.");
  } catch (err) {
    console.error("Error creating file:", err);
  }
}

async function runMigration(migrationfilePath, fileName) {
  try {
    if (fileName != null) {
      const tableStatusCheck = await checkTableExecutionStatus(fileName);

      if (!tableStatusCheck) {
        const migration = require(migrationfilePath);

        await migration.up(dynamoInterface);

        await addTableName(fileName);
      }
    } else {
      const dirents = await fs.readdir(CONSTANTS.MIGRATIONS, {
        withFileTypes: true,
      });

      const presentMigrationsFiles = dirents
        .filter((dirent) => dirent.isFile())
        .map((dirent) => dirent.name);

      const allActiveMigrations = await fetchAllMigrationNames();

      const executionRemainingFiles = presentMigrationsFiles.filter(
        (ele) => !allActiveMigrations.includes(ele)
      );

      for (let fileName of executionRemainingFiles) {
        const migrationfilePath = path.join(
          __dirname,
          `../${CONSTANTS.MIGRATIONS}`,
          fileName
        );

        const migration = require(migrationfilePath);

        await migration.up(dynamoInterface);
        await addTableName(fileName);
        console.log(`Migration ${fileName} executed sucessfully`);
      }
    }
  } catch (err) {
    console.log("Unable to run migration", err);
  }
}

async function undoMigration(fileName, allFlag, migrationfilePath) {
  try {
    const allActiveMigrations = await fetchAllMigrationNames();
    if (fileName && !allFlag) {
      const tableStatusCheck = await checkTableExecutionStatus(fileName);

      if (tableStatusCheck) {
        const migration = require(migrationfilePath);

        await deleteTableName(fileName);
        await migration.down(dynamoInterface);

        console.log(`Migration ${fileName} undo sucessfully`);
      }
    } else if (!fileName && allFlag) {
      for (let fileName of allActiveMigrations) {
        const migrationfilePath = path.join(
          __dirname,
          `../${CONSTANTS.MIGRATIONS}`,
          fileName
        );

        const migration = require(migrationfilePath);

        await deleteTableName(fileName);
        await migration.down(dynamoInterface);

        console.log(`Migration ${fileName} undo sucessfully`);
      }
    } else if (!fileName && !allFlag) {

      if(allActiveMigrations.length>0){
        const latestMigrationRun = allActiveMigrations
        .map((file) => ({
          name: file,
          timestamp: file.split("-")[0],
        }))
        .sort((a, b) => b.timestamp - a.timestamp)
        .shift();

        

      const fileName = latestMigrationRun.name;

      const latestRunMigrationFilePath = path.join(
        __dirname,
        `../${CONSTANTS.MIGRATIONS}`,
        fileName
      );
      const migration = require(latestRunMigrationFilePath);

      await deleteTableName(fileName);
      await migration.down(dynamoInterface);

      console.log(`Migration ${fileName} undo sucessfully`);
      }
      else{
        console.log("No migrations to undo")
      }
      
    }
  } catch (err) {
    console.log("Unable to undo migration", err);
  }
}

module.exports = {
  createFolder,
  createMigration,
  runMigration,
  undoMigration,
};
