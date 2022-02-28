import { Command } from 'commander';
import {execSync} from 'child_process';
import {prompt, QuestionCollection} from "inquirer"
import * as  fs from 'fs-extra';
import { addResolverToGraphql } from './graphql';
// const fs = require('fs-extra')
const resolverDirPre = "src/lambdas"
const templateDir = "template"

const resolverQuestions = [
  {
    type: 'list',
    name: 'resolverType',
    message: 'Which type do you want to add?',
    choices: ['Mutation', 'Query', 'Subscription'],
    filter(val:string) {
      return val.toLowerCase();
    },
  },
  {
    type: "input",
    name: "resolverName",
    validate(value: string) {
      const pass = value.match(
        /^[a-z][a-zA-Z]+$/g
      );
      if (!pass) {
        return 'Please enter a valid lowerCamelCase name';
      }
      if (value.length <= 3) {
        return 'too short';
      }

      // if () {
      //   return 'resolver with same name exists';
      // }
      return true;
    },
  },
]

const createResolver = async ({resolverName, resolverType}:{resolverType: string, resolverName: string}) => {
  console.log("🚀 ~ file: api.ts ~ line 41 ~ createResolver ~ resolverName, resolverType", resolverName, resolverType)
  const resolverDir = `${resolverDirPre}/${resolverName}`
  fs.pathExistsSync(resolverDir) || fs.mkdirSync(resolverDir);
  const resolverPath = `${resolverDir}/index.ts`;
  fs.copySync(`${templateDir}/resolver.ts`, resolverPath);
  
  console.log(`edit resolver logic here: ${resolverPath}`)
}

export const addApiCommand = (program: Command) :void => {
  const api = program
    .command('api')
    .description('api related commands')
  const graphql = api
    .command('graphql')
    .description('graphql related commands')
  graphql
    .command('create')
    .description('create graphql resolver')
    .action(async() => {
        const answers = await prompt(resolverQuestions)
        console.log('\nOrder receipt:');
        console.log(JSON.stringify(answers, null, '  '));
        await createResolver(answers)
        await addResolverToGraphql(answers)
    });
}
