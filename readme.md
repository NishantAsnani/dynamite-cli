# 🚀 dynamo-cli

> A CLI tool to handle **migrations** and **seeders** for DynamoDB with ease.

---

## 📦 Features

- Create migration files with partition/sort keys and data types  
- Run individual or all pending migrations  
- Create and run seeders with type validation  
- Undo migrations (latest, specific, or all)  
- Force-run seeders (irreversible)  
- Track migration/seeder run status via metadata  
- Helpful warnings and edge case handling  

---

## ⚙️ Installation

Since it's not published to npm yet, you can run it locally using:


 node index.js <command> [options]

##  🧪 Requirements

-  node.js 14 or higher  
- AWS credentials in a `.env` file with:  

AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=your_region


- IAM permissions needed for DynamoDB:  
- `dynamodb:CreateTable`  
- `dynamodb:DeleteTable`  
- `dynamodb:DescribeTable`
- `dynamodb:ListTables`  
- `dynamodb:PutItem`  
- `dynamodb:DeleteItem`  
- `dynamodb:Query`
- `dynamodb:Scan`



## 🛠️ Usage

### Help

Display CLI help menu:
```bash node index.js --help ```

### Create Migration

Create a migration without a sort key:
```bash node index.js migration:create --name "create-users" --partitionKey id:N```

Create a migration with a sort key:
```bash node index.js migration:create --name "create-tenants" --partitionKey id:N --sortKey tenantId:S```


### Run Migrations

Run a specific migration by name:
```bash node index.js migration:run --name "your-migration-name"```

Run all pending migrations:
```bash node index.js migration:run --all```


### Undo Migrations

Undo a specific migration by name:
```bash node index.js migration:undo --name "your-migration-name" ```

Undo the latest run migration:
```bash node index.js migration:undo ```

Undo all migrations:
```bash node index.js migration:undo --all ```


### Create Seeders

Create a seeder (same as migration command syntax):
```bash node index.js seed:create --name "your-seeder-file-name" ```

### Run Seeders

Run a specific seeder:
```bash node index.js seed:run --name "your-seeder-name" ```

Force rerun a seeder: (As seeder undoing is not possible)
```bash node index.js seed:run --name "your-seeder-file" --force ```

### List Migration and Seeder Status

Check status of all migrations and seeders:
```bash node index.js list ```

## 💰 AWS Billing Notice

This tool performs real AWS operations and may incur costs if you're outside the AWS Free Tier. Use with caution, especially in production environments.

## 📃 License

This project is licensed under the [MIT License](./LICENSE).