# 🧨 dynamite-cli

 A CLI tool to handle **migrations** and **seeders** for DynamoDB with ease.

**Note:** This is an early release — tested manually, but bugs may exist. PRs and issues are welcome!

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

```bash
npm i dynamite-cli
```

##  🧪 Requirements

- node.js 14 or higher  
- AWS credentials provided in **one** of the following ways:
  - **Option 1:** In a `.env` file in your project root with:
    ```
    AWS_ACCESS_KEY_ID=your_key
    AWS_SECRET_ACCESS_KEY=your_secret
    AWS_REGION=your_region
    ```
  - **Option 2:** Already configured globally via [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html) (`aws configure`).  
    If your AWS credentials are set up using the AWS CLI, you do not need a `.env` file.

### IAM permissions needed for DynamoDB:  

- `dynamodb:CreateTable`  
- `dynamodb:DeleteTable`  
- `dynamodb:DescribeTable`
- `dynamodb:ListTables`  
- `dynamodb:PutItem`  
- `dynamodb:DeleteItem`  
- `dynamodb:Query`
- `dynamodb:Scan`



## 🛠️ Usage

npm i dynamite-cli

### Display Help

Show the CLI help menu with all available commands and options.
```bash
npx dynamite-cli --help
```


---

### Create a Migration

Generate a new migration file with a partition key (and optional sort key).

![Create Migration Screenshot](assets/migration-create-1.png)
![Create Migration Screenshot](assets/migration-create-2.png)
![Create Migration Screenshot](assets/migration-create-3.png)



```bash
npx dynamite-cli migration:create --name "tableName" --partitionKey id:N
```
- `--name` Name of the migration file.
- `--partitionKey` Partition key definition (`name:type`).
- `--sortKey` *(optional)* Sort key definition (`name:type`).
- Available types: `N` = Number, `S` = String, `B` = Binary.
- If not specified, the default type is `N` (Number).

Example with a sort key:
```bash
npx dynamite-cli migration:create --name "tableName" --partitionKey id:N --sortKey tenantId:S
```

---

### Run Migrations

Apply migrations to your DynamoDB tables.

![Run Migration Screenshot](assets/migration-run.png)

**Run a specific migration by name:**
```bash
npx dynamite-cli migration:run --name "your-migration-name"
```

**Run all pending migrations:**
```bash
npx dynamite-cli migration:run
```

---

### Undo Migrations

Revert previously applied migrations.

![Undo Migration Screenshot](assets/migration-undo.png)

**Undo a specific migration by name:**
```bash
npx dynamite-cli migration:undo --name "your-migration-name"
```

**Undo the latest run migration:**
```bash
npx dynamite-cli migration:undo
```

**Undo all migrations:**
```bash
npx dynamite-cli migration:undo --all
```

---

### Create a Seeder

Generate a new seeder file.

![Create Seeder Screenshot](assets/seed-create-1.png)
![Create Seeder Screenshot](assets/seed-create-2.png)
![Create Seeder Screenshot](assets/seed-create-3.png)

```bash
npx dynamite-cli seed:create --name "your-seeder-name"
```
- `--name` Name of the seeder file.

---

### Run Seeders

Populate your tables with seed data.



**Run a specific seeder:**
```bash
npx dynamite-cli seed:run --name "your-seeder-name"
```

**Force rerun a seeder (irreversible):**
```bash
npx dynamite-cli seed:run --name "your-seeder-name" --force
```

> ⚠️ Seeder files cannot be undone. Use the `--force` flag to rerun a seeder if needed.

---

### List Migration and Seeder Status

Display the status of all migrations and seeders.

![List Status Screenshot](assets/status-list.png)

```bash
npx dynamite-cli list
```

## 💰 AWS Billing Notice

This tool performs real AWS operations and may incur costs if you're outside the AWS Free Tier. Use with caution, especially in production environments.

## 📃 License

This project is licensed under the [MIT License](./LICENSE).