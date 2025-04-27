const fs = require("fs").promises;
const path = require("path");
const { CONSTANTS } = require("../constants");
const { createSkeletonTable,checkTableExists } = require("../skeleton-file");

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
      } else {
        throw err; 
      }
    }

    

    const skeletalFile =  createSkeletonTable(
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

module.exports = {
  createFolder,
  createMigration,
};
