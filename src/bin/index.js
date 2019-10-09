#!/usr/bin/env node

import program from 'commander';
import loadPage from '../loader';

program
  .description('Download web page')
  .arguments('<outdir> <pagelink>')
  .option('-o, --output', 'output directory')
  .parse(process.argv);

const { args } = program;
const [outPath, link] = program.output ? args : ['./', args[0]];
const errors = {
  ENOENT: 'Error: no such file or directory',
  EACCES: 'Error: permission denied',
  ENOTFOUND: 'Error: page not found',
  404: 'Error: page not found',
};

loadPage(link, outPath)
  .catch((err) => {
    const { message } = err;
    if (errors[message]) {
      console.error(errors[message]);
      return;
    }
    console.error(message);
  });
