const {
  createMigration,
  runMigration,
  undoMigration,
  createSeeder
} = require("./file-utils");
const path = require("path");
const { CONSTANTS } = require("../constants");
const { fetchAllMigrationNames } = require("../helper/migration-meta");
const fs=require('fs').promises

async function handleCreateMigration(options) {
  try {
    const tableName = options.name;
    const migrationName = tableName.endsWith(".js")
      ? tableName
      : `${tableName}.js`;
    const finalName = `${Date.now()}-create-table-${migrationName}`;
    const { partitionKey, sortKey } = options;
    const [partitionKeyName, partitionKeyType = "N"] = partitionKey.split(":");
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

    return true;
  } catch (err) {
    return false;
  }
}

async function handleRunMigration(options) {
  try {
    const fileName = options.name;
    const migrationFilePath = fileName
      ? path.join(__dirname, `../${CONSTANTS.MIGRATIONS}`, fileName)
      : null;

    await runMigration(migrationFilePath, fileName);
  } catch (err) {
    console.log(err)
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

async function handleCreateSeeder(options) {
  try {
    const seederName = options.name;
    const migrationName = seederName.endsWith(".js")
      ? seederName
      : `${seederName}.js`;
    const finalName = `${Date.now()}-${CONSTANTS.SEEDERS}-${migrationName}`;

    await createSeeder(finalName);
  } catch (err) {
    return false;
  }
}

async function handleRunSeeder(options) {
  try {
    const fileName = options.name;
    const isForced=options.force;
    const seederFilePath = fileName
      ? path.join(__dirname, `../${CONSTANTS.SEEDERS}`, fileName)
      : null;

    await runMigration(seederFilePath, fileName, true,isForced);
  } catch (err) {
    return false;
  }
}

async function handleListStatus(){
  try{
    

    const allExecutedMigrations = [];
    const allExecutedSeeders = [];
    const executedFiles= await fetchAllMigrationNames()

    executedFiles.forEach((file) => {
      const secondPart = file.split("-")[1]; 
      if (secondPart == CONSTANTS.SEEDERS) {
        allExecutedSeeders.push(file); 
      } else {
        allExecutedMigrations.push(file); 
      }
    });

    const types = [
      { type: 'Migration', folder: CONSTANTS.MIGRATIONS, executedFiles: allExecutedMigrations },
      { type: 'Seeder', folder: CONSTANTS.SEEDERS, executedFiles: allExecutedSeeders },
    ];
  

    for (const { type, folder, executedFiles } of types) {
      const filesInFolder = await fs.readdir(folder);
  
      console.log(`\n📦 ${type} Status`);
      
      for (const file of filesInFolder) {
        const status = executedFiles.includes(file) ? '✅ RUN' : '❌ PENDING';
        console.log(`✔️  ${file.padEnd(35)} ${status}`);
      }
    }
  }
  catch(err){
    console.log(err)
    return false;
  }
  
}

module.exports = {
  handleCreateMigration,
  handleRunMigration,
  handleUndoMigration,
  handleCreateSeeder,
  handleRunSeeder,
  handleListStatus
};
