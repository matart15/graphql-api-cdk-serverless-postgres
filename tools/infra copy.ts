import { Separator, QuestionCollection } from 'inquirer';
import { SubCommand } from '../cli';

// export default async (): Promise<void> => {

// const questions = [
//   {
//     type: 'confirm',
//     name: 'bacon',
//     message: 'Do you like bacon?',
//   },
//   {
//     type: 'input',
//     name: 'favorite',
//     message: 'Bacon lover, what is your favorite type of bacon?',
//     when(answers:any) {
//       return answers.bacon;
//     },
//   },
//   {
//     type: 'confirm',
//     name: 'pizza',
//     message: 'Ok... Do you like pizza?',
//     when(answers: any) {
//       return !likesFood('bacon')(answers);
//     },
//   },
//   {
//     type: 'input',
//     name: 'favorite',
//     message: 'Whew! What is your favorite type of pizza?',
//     when: likesFood('pizza'),
//   },
// ];

// function likesFood(aFood: string) {
//   return function (answers: any) {
//     return answers[aFood];
//   };
// }

// prompt(questions).then((answers) => {
//   console.log(JSON.stringify(answers, null, '  '));
// });
// }

const checkboxQuestions1: QuestionCollection = [
  // Input
  {
    type: 'input',
    message: "What's your name",
    name: 'name',
  },
  // List
  {
    type: 'list',
    name: 'color',
    message: 'What do you like color?',
    choices: [
      'black',
      'red',
      {
        name: 'orange',
        disabled: 'disabled',
      },
      'green',
    ],
  },
  // Checkbox
  {
    type: 'checkbox',
    message: 'select',
    name: 'select',
    choices: [
      new Separator(' = Choise A = '),
      { name: 'hoge' },
      { name: 'fuga' },
      { name: 'foo' },
    ],
    validate: (answer: any): boolean | string => {
      if (answer.length < 1) {
        return 'You must choose';
      }

      return true;
    },
  },
];
export const someCommand: SubCommand = {
  command: 'version',
  description: 'displays version',
  cliOption: {
    optionName: '-c, --choise1',
    optionDescription: 'run recursively',
  },
  questions: checkboxQuestions1,
  handler: async (answers: any) => {
    console.log('your inputs are : ', JSON.stringify(answers, null, '  '));
  },
};
