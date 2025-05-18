const fs = require("fs").promises;
const path = require("path");
const { CONSTANTS } = require("../constants");
const { skeletalMigration } = require("../skeleton-file");
const {
  createMetaDataTable,
  addTableName,
  deleteTableName,
  checkTableExecutionStatus,
  fetchAllMigrationNames,
} = require("../helper/migration-meta");
const { dynamoInterface } = require("./dynamo-interface");
const {logger}=require('../helper/logger')
const {STATUS}=require('../constants')

async function createFolder(folderName) {
  try {
    const folderPath = path.join(__dirname, `../${folderName}`);
    await fs.mkdir(folderPath, { recursive: true });
  } catch (err) {
    logger.error(err);
  }
}

async function createMigration(
  tableName,
  fileName,
  partitionKeyName,
  partitionKeyType,
  sortKeyName,
  sortKeyType,
) {
  try {
    const folderPath = path.join(__dirname, `../${CONSTANTS.MIGRATIONS}`);
    const filePath = path.join(folderPath, fileName);

    try {
      const stats = await fs.stat(folderPath);
      if (!stats.isDirectory()) {
        logger.info("Path exists but is not a folder.");
        return;
      }
    } catch (err) {
      if (err.code === "ENOENT") {
        logger.info("Folder does not exist, creating...");
        await createFolder(CONSTANTS.MIGRATIONS);
        await createMetaDataTable();
      } else {
        throw err;
      }
    }

    
       const skeletalFile = skeletalMigration.createTableSkeleton(
        tableName,
        partitionKeyName,
        partitionKeyType,
        sortKeyName,
        sortKeyType
      );
    

    await fs.writeFile(filePath, skeletalFile);
    logger.success("Migration file created successfully.");
  } catch (err) {
    console.error("Error creating migration file:", err);
  }
}

async function createSeeder(fileName){
  try {
    const folderPath = path.join(__dirname, `../${CONSTANTS.SEEDERS}`);
    const filePath = path.join(folderPath, fileName);


    try {
      const stats = await fs.stat(folderPath);
      if (!stats.isDirectory()) {
        logger.warn("Path exists but is not a folder.");
        return;
      }
    } catch (err) {
      if (err.code === "ENOENT") {
        logger.info("Folder does not exist, creating...");
        await createFolder(CONSTANTS.SEEDERS);
      } else {
        logger.error(err) 
      }
    }

    const skeletalFile=skeletalMigration.seederSkeleton()
    
    await fs.writeFile(filePath, skeletalFile);
    logger.success("Seeder file created successfully.");
  } catch (err) {
    logger.error("Error creating seeder file:", err);
  }
}

async function runMigration(migrationfilePath, fileName, isSeederFile = false,isForced=false) {
  try {
    const fileType=isSeederFile?"Seeder":"Migration"
    if (fileName != null) {
      let fileStatus=false;
      const checkStatus = await checkTableExecutionStatus(fileName,isSeederFile);

      if(checkStatus.isSuccess){
        fileStatus=false
      }
      else if(!checkStatus.isSuccess){
        if(checkStatus.status==STATUS.NOT_EXISTS){
          logger.warn(`⚠️ ${fileType} with name '${fileName}' does not exist.`);
          return;
        }
        else if(checkStatus.status==STATUS.NOT_FOUND) {
          fileStatus=true
        }
      }
      
      const allowRun = fileStatus || (isSeederFile && isForced);


      if (!allowRun) {
        if (isSeederFile) {
          logger.warn(`⚠️  ${fileType} '${fileName}' has already been run. Use --force to re-run.`);
        } else {
          logger.warn(`⚠️ ${fileType} '${fileName}' has already been run.`);
        }
        return;
      }
      


      const migration = require(migrationfilePath);
      await migration.up(dynamoInterface);
      
      await addTableName(fileName)
      
      logger.success(`✅ ${fileType} ${fileName} executed successfully`);
      
    } else {

      const folderName=isSeederFile?CONSTANTS.SEEDERS:CONSTANTS.MIGRATIONS
      
     
        const dirents = await fs.readdir(folderName, {
          withFileTypes: true,
        });

        const presentMigrationsFiles = dirents
          .filter((dirent) => dirent.isFile())
          .map((dirent) => dirent.name);

        const allActiveMigrations = await fetchAllMigrationNames();

        const executionRemainingFiles = presentMigrationsFiles.filter(
          (ele) => !allActiveMigrations.includes(ele)
        );

        if(executionRemainingFiles.length==0){
          logger.info("All migrations have already been executed")
          process.exit(1);
        }

        for (let fileName of executionRemainingFiles) {
          const migrationfilePath = path.join(
            __dirname,
            `../${folderName}`,
            fileName
          );

          const migration = require(migrationfilePath);

          await migration.up(dynamoInterface);
          await addTableName(fileName);
          logger.success(`${fileType} ${fileName} executed sucessfully`)
        }
      
    }
  } catch (err) {
    logger.error("Unable to run migration", err);
  }
}

async function undoMigration(fileName, allFlag, migrationfilePath) {
  try {
    const allActiveMigrations = await fetchAllMigrationNames();
    const filterMigrations = allActiveMigrations.filter(
      (file) => file.split("-")[1] != CONSTANTS.SEEDERS
    );

    if (fileName && !allFlag) {
      const tableStatusCheck = await checkTableExecutionStatus(fileName);

      if (tableStatusCheck.isSuccess) {
        const migration = require(migrationfilePath);

        await deleteTableName(fileName);
        await migration.down(dynamoInterface);

        logger.success(`Migration ${fileName} undo sucessfully`);
      }
      else if(!tableStatusCheck.isSuccess){
        logger.warn(`⚠️ Cannot undo ${fileName} migration as it has not been run`)
      }
    } else if (!fileName && allFlag) {
      for (let fileName of filterMigrations) {
        const migrationfilePath = path.join(
          __dirname,
          `../${CONSTANTS.MIGRATIONS}`,
          fileName
        );

        const migration = require(migrationfilePath);

        await deleteTableName(fileName);
        await migration.down(dynamoInterface);

        logger.success(`Migration ${fileName} undo sucessfully`);
      }
    } else if (!fileName && !allFlag) {
      if (filterMigrations.length > 0) {
        const latestMigrationRun = filterMigrations
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

        logger.success(`Migration ${fileName} undo sucessfully`);
      } else {
        logger.info("No migrations to undo");
      }
    }
  } catch (err) {
    logger.error("Unable to undo migration", err);
  }
}




module.exports = {
  createFolder,
  createMigration,
  runMigration,
  undoMigration,
  createSeeder,
};
