#!/usr/bin/env node

import commander from 'commander';
import loadPage from '../loader';

const program = new commander.Command();
program
  .option('-o, --output', 'output directory');

program.parse(process.argv);
const { args } = program;
const [outPath, link] = program.output ? args : ['./', args[0]];

loadPage(link, outPath)
  .catch((err) => console.log(err.code));
