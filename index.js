const {program}=require('commander');


program.command('hello').action(() => {
    console.log('Hello from Dynamo CLI!');
  });
program.parse(process.argv);