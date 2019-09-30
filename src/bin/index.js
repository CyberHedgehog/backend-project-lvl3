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

loadPage(link, outPath);
