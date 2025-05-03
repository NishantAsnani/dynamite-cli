function createSkeletalMigration(
  tableName,
  partitionKeyName,
  partitionKeyType,
  sortKeyName,
  sortKeyType
) {
  return `

module.exports = {
  up: async (dynamoInterface) => {
    await dynamoInterface.createTable('${tableName}', 
       { name: '${partitionKeyName}', type: '${partitionKeyType}' },
       { name: '${sortKeyName}', type: '${sortKeyType}' },
    );
  },

  down: async (dynamoInterface) => {
    await dynamoInterface.dropTable('${tableName}');
  }
};`;
}

module.exports = {
  createSkeletalMigration,
};
