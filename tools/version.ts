import { Command } from 'commander';

export const addVersionCommand = (program: Command) :void => {
  program
    .command('version')
    .description('displays version')
    .action( () => {
      console.log("1.0.0")
    });
}
