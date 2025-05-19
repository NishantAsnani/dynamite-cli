const {
  createMigration,
  runMigration,
  undoMigration,
  createSeeder,
} = require("./file-utils");
const path = require("path");
const { CONSTANTS } = require("../constants");
const { fetchAllMigrationNames } = require("../helper/migration-meta");
const fs = require("fs").promises;
const {logger}=require('../helper/logger')
const dirPath=process.cwd()

async function handleCreateMigration(options) {
  try {
    const tableName = options.name;

    if (/\s/.test(tableName)) {
      logger.error(
        "Spaces are not allowed in migration names. Use hyphens or underscores instead."
      );
      process.exit(1);
    }
    const migrationName = tableName.endsWith(".js")
      ? tableName
      : `${tableName}.js`;
    const finalName = `${Date.now()}-create-table-${migrationName}`;
    const { partitionKey, sortKey } = options;
    const [partitionKeyName, partitionKeyType = "N"] = partitionKey.split(":");
    const [sortKeyName, sortKeyType = "N"] = sortKey
      ? sortKey.split(":")
      : [null, "N"];

    if (!partitionKeyName) {
      logger.error("Partition key name is required.");
      return false;
    }

    if (!partitionKey.includes(":")) {
      logger.warn(
        `No type provided for partition key "${partitionKey}". Defaulting to "N" (Number).`
      );
    }

    const allowedTypes = ["S", "N", "B"];
    if (!allowedTypes.includes(partitionKeyType)) {
      logger.error("Invalid partitionKey type. Allowed types: S (String), N (Number), B (Binary).");
      return false;
    }

    if (sortKey) {
      if (!sortKeyName) {
        logger.error("Sort key name is missing.");
        return false;
      }

      if (!allowedTypes.includes(sortKeyType)) {
        logger.error("Invalid sort key type. Allowed types: S (String), N (Number), B (Binary).");
        return false;
      }

      if (!sortKey.includes(":")) {
        logger.warn(
          `No type provided for partition key "${sortKey}". Defaulting to "N" (Number).`
        );
      }
    }

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
    logger.error(err)
    throw err;
  }
}

async function handleRunMigration(options) {
  try {
    const fileName = options.name;
    const migrationFilePath = fileName
      ? path.join(dirPath, `./${CONSTANTS.MIGRATIONS}`, fileName)
      : null;

    await runMigration(migrationFilePath, fileName);
  } catch (err) {
    logger.error(err);
    throw err;
  }
}

async function handleUndoMigration(options) {
  try {
    const fileName = options.name;
    const allFlag = options.all;
    const migrationfilePath = fileName
      ? path.join(dirPath, `./${CONSTANTS.MIGRATIONS}`, fileName)
      : null;

    await undoMigration(fileName, allFlag, migrationfilePath);
  } catch (err) {
    logger.error(err);
    throw err;
  }
}

async function handleCreateSeeder(options) {
  try {
    const seederName = options.name;
    const migrationName = seederName.endsWith(".js")
      ? seederName
      : `${seederName}.js`;
    const finalName = `${Date.now()}-${CONSTANTS.SEEDERS}-${migrationName}`;

    if (/\s/.test(seederName)) {
      logger.error(
        "Spaces are not allowed in seeder names. Use hyphens or underscores instead."
      );
      process.exit(1);
    }
    await createSeeder(finalName);
  } catch (err) {
    logger.error(err);
    throw err;
  }
}

async function handleRunSeeder(options) {
  try {
    const fileName = options.name;
    const isForced = options.force;
    const seederFilePath = fileName
      ? path.join(dirPath, `./${CONSTANTS.SEEDERS}`, fileName)
      : null;

    await runMigration(seederFilePath, fileName, true, isForced);
  } catch (err) {
    logger.error(err);
    throw err;
  }
}

async function handleListStatus() {
  try {
    const allExecutedMigrations = [];
    const allExecutedSeeders = [];
    const executedFiles = await fetchAllMigrationNames();

    executedFiles.forEach((file) => {
      const secondPart = file.split("-")[1];
      if (secondPart === CONSTANTS.SEEDERS) {
        allExecutedSeeders.push(file);
      } else {
        allExecutedMigrations.push(file);
      }
    });

    const types = [
      {
        type: "Migration",
        folder: CONSTANTS.MIGRATIONS,
        executedFiles: allExecutedMigrations,
      },
      {
        type: "Seeder",
        folder: CONSTANTS.SEEDERS,
        executedFiles: allExecutedSeeders,
      },
    ];

    let totalFilesFound = 0;

    for (const { type, folder, executedFiles } of types) {
      let filesInFolder = [];
      try {
        filesInFolder = await fs.readdir(path.join(process.cwd(), folder));
      } catch (err) {
        if (err.code !== 'ENOENT') throw err; // ignore "folder doesn't exist", but throw other errors
      }

      if (filesInFolder.length === 0) continue;

      totalFilesFound += filesInFolder.length;

      console.log(`\n📦 ${type} Status`);

      for (const file of filesInFolder) {
        const status = executedFiles.includes(file) ? "✅ RUN" : "❌ PENDING";
        console.log(`✔️  ${file.padEnd(35)} ${status}`);
      }
    }

    if (totalFilesFound === 0) {
      console.warn("\n⚠️  No migrations or seeders found");
    }
  } catch (err) {
    logger.error(err);
    throw err;
  }
}

module.exports = {
  handleCreateMigration,
  handleRunMigration,
  handleUndoMigration,
  handleCreateSeeder,
  handleRunSeeder,
  handleListStatus,
};
