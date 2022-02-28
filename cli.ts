#!/usr/bin/env ts-node

import { Command } from 'commander';
import { prompt, QuestionCollection } from 'inquirer';
import { subcommands } from './tools';
import { addApiCommand } from './tools/api/index';
import { addInfraCommand } from './tools/infra';
import { addVersionCommand } from './tools/version';

const program = new Command();

export type SubCommand = {
  command: string;
  description: string;
  cliOption: {
    optionName: string;
    optionDescription: string;
  };
  questions: QuestionCollection;
  handler: (answers: any) => Promise<void>;
};

// subcommands.forEach((subcommand) => {
//   program
//     .command(subcommand.command)
//     .description(subcommand.description)
//     .option(
//       subcommand.cliOption.optionName,
//       subcommand.cliOption.optionDescription,
//     )
//     .action((options, a1, a2) => {
//       console.log(`server on port `, options, a1, a2);
//       const name = process.argv[3];

//       if (!name) {
//         console.error('Please pass one argument!!');
//         process.exit(1);
//       }
//       prompt(subcommand.questions).then((answers: any) => {
//         console.log(
//           'your inputs are 1 : ',
//           JSON.stringify(answers, null, '  '),
//         );
//         subcommand.handler(answers).catch((err) => {
//           console.error(err);
//           process.exit(1);
//         });
//       });
//     });
// });

addVersionCommand(program);
addInfraCommand(program)
addApiCommand(program)

program.parse();
