import { Command, Argument } from 'commander';
import {execSync} from 'child_process';
// const { exec } = require('child_process');

const infraCommands = [{
  name: 'cdk',
}, {
  name: 'doctor',
}]

export const addInfraCommand = (program: Command) :void => {
  const infra = program
    .command('infra')
    .description('infra related commands')
  infra
    .command('cdk')
    .description('cdk related commands')
    .addArgument(new Argument('<subcommand>', 'drink cup size')
    .choices(infraCommands.map(inf => inf.name)))

  infra
    .command('list')
    .description('Lists all stacks in the app')
    // .addArgument(new Argument('[timeout]', 'timeout in seconds')
    // .default(60, 'one minute'))
    .action( (subcommand, timeout) => {
        const stdout = execSync('cd infra; cdk list --profile salescircle -c config=dev' );
    });
}
