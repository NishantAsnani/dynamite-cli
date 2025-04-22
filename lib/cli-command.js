const { program } = require("commander");
const { createFolder } = require("./file-utils");


function createMigrations() {
  program
    .command("create-migrations")
    .description("Create migrations")
    .action(createFolder);

  program.parse(process.argv);
}


module.exports={
    createMigrations
}