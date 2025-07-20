#!/usr/bin/env node
import chalk from 'chalk';
import { Command } from 'commander';
import shell from 'shelljs';
import inquirer from 'inquirer';

const questions = [
  {
    type: 'list',
    name: 'selectedApp',
    message: 'Use Arrow Keys to Select an App',
    default: 'Chrome extension built with create-chrome-extension',
    choices: [
      'aircraft',
      'airport-logistics',
      'airports',
      'countries',
      'general',
      'notifications',
      'permits',
      'restrictions',
      'time-zone',
      'user-management',
      'vendor-management',
    ],
  },
];

// Setup Programs
const program = new Command();

program
  .description('CLI to Run Wings MFE Apps')
  .version('1.0')
  .option('--debug', 'Debug App for errors details')
  .action(async options => {
    process.env.IS_DEBUG = options.debug;
    console.log('description', program.description());
    console.log(chalk.green('Welcome to wings MFE Solution Select Your App which you want to start'));
    // Ask Questions from User
    const answers = await inquirer.prompt(questions);
    console.log('---------------------------------------------');
    try {
      console.log('answers.name', answers);
      console.log(
        chalk.green(`Starting app -> ${answers.selectedApp}. Please wait for compilation before start using this app`)
      );
      console.log('appPath', process.cwd());
      shell.exec(`concurrently --kill-others-on-fail \"yarn dev:host\" \"yarn dev:${answers.selectedApp}\"`);
    } catch (error) {
      console.log('file', error);
    }
  })
  .on('--help', () => {
    console.log(`Only ${chalk.green('<extension-name>')} is required.`);
  })
  .on('error', e => {
    console.log(chalk.red('Some error happen', e));
  });

program.parse(process.argv);
