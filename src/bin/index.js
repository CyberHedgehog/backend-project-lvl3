#!/usr/bin/env node

import program from 'commander';
import Listr from 'listr';
import loadPage from '../loader';

program
  .description('Download web page')
  .arguments('<outdir> <pagelink>')
  .option('-o, --output', 'output directory')
  .parse(process.argv);

const { args } = program;
const [outPath, link] = program.output ? args : ['./', args[0]];
const errorMessages = {
  ENOENT: 'No such file or directory',
  EACCES: 'Permission denied',
  ENOTFOUND: 'Page not found',
  404: 'Page not found',
  EEXIST: 'Output directory already exists',
};

const tasks = new Listr([
  {
    title: `Downloading ${link}`,
    task: () => loadPage(link, outPath)
      .catch((err) => {
        const { message } = err;
        throw new Error(errorMessages[message]);
      }),
  },
]);

tasks.run().catch((err) => err);
