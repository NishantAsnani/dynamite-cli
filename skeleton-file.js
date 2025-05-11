const skeletalMigration = {
  createTableSkeleton: (tableName, partitionKeyName, partitionKeyType, sortKeyName, sortKeyType) => {
    const sortKeyLine = sortKeyName
      ? `,\n       { name: '${sortKeyName}', type: '${sortKeyType}' }`
      : '';

    return `

module.exports = {
  up: async (dynamoInterface) => {
    await dynamoInterface.createTable('${tableName}', 
       { name: '${partitionKeyName}', type: '${partitionKeyType}' }${sortKeyLine}
    );
  },

  down: async (dynamoInterface) => {
    await dynamoInterface.dropTable('${tableName}');
  }
};`;
  },
  seederSkeleton: () => {
    return `
  // Seeder Template
  // ------------------------------
  // Insert one or more records into a DynamoDB table using the "addData" method.
  //
  //  To insert multiple records, pass an array of objects:
  //    await dynamoInterface.addData('Your-Table-Name', [ { ... }, { ... } ]);
  //
  //  To insert a single record, pass a single object:
  //    await dynamoInterface.addData('Your-Table-Name', { ... });
  //
  //  IMPORTANT:
  // - Make sure each record includes the required keys (Partition Key, and Sort Key if applicable).
  // - Replace 'Your-Table-Name' and 'Your Data Object' with actual values.
  
  module.exports = {
    up: async (dynamoInterface) => {
      await dynamoInterface.addData('Your-Table-Name', 'Your Data Object');
    },
  };
  `;
  }
  
};




module.exports = {
  skeletalMigration,
};
