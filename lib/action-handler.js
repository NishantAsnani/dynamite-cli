const {  createMigration,runMigration } = require("./file-utils");
const path=require('path')
const {CONSTANTS}=require('../constants')

async function handleCreateMigration(options) {
  try {
    const fileName = options.name;
    const { partitionKey, sortKey } = options;
    const [partitionKeyName, partitionKeyType = "N"] = partitionKey.split(":");
    const [sortKeyName, sortKeyType = "N"] = sortKey
      ? sortKey.split(":")
      : [null, "N"];
    const migrationName = fileName.endsWith(".js")
      ? fileName
      : `${fileName}.js`;
    const finalName = `${Date.now()}-${migrationName}`;
    await createMigration(
      fileName,
      finalName,
      partitionKeyName,
      partitionKeyType,
      sortKeyName,
      sortKeyType
    );

    return true
  } catch (err) {
    return false;
  }
}

async function handleRunMigration(options){
    try{
    const fileName=options.name
    const migrationfilePath=fileName?path.join(__dirname,`../${CONSTANTS.MIGRATIONS}`,fileName):null
    await runMigration(migrationfilePath,fileName)
    }catch(err){
        return false
    }
}


module.exports = {
  handleCreateMigration,
  handleRunMigration
};
