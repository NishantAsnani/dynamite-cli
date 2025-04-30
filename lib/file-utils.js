const fs = require("fs").promises;
const path = require("path");
const { CONSTANTS } = require("../constants");
const { createSkeletonTable } = require("../skeleton-file");
const {
  createMetaDataTable,
  addTableName,
  checkTableExecutionStatus,
  fetchAllMigrationNames,
} = require("../helper/migration-meta");
const { exec } = require("child_process");

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

    const skeletalFile = createSkeletonTable(
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
        exec(`node ${migrationfilePath}`, (error, stdout, stderr) => {
          if (error) {
            console.error(
              `❌ Error executing migration file ${migrationfilePath}:`,
              error
            );
            return;
          }
          if (stderr) {
            console.error(`❌ Standard error: ${stderr}`);
            return;
          }
          console.log(
            `${fileName} migration executed successfully: \n${stdout}`
          );
        });

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

        exec(`node ${migrationfilePath}`, (error, stdout, stderr) => {
          if (error) {
            console.error(
              ` Error executing migration file ${migrationfilePath}:`,
              error
            );
            return;
          }
          if (stderr) {
            console.error(`Standard error: ${stderr}`);
            return;
          }
          console.log(
            `${fileName} migration executed successfully: \n${stdout}`
          );
        });

        await addTableName(fileName);
      }
    }
  } catch (err) {
    console.log("Unable to run migration", err);
  }
}

module.exports = {
  createFolder,
  createMigration,
  runMigration,
};
