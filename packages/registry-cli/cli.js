#!/usr/bin/env node

const config = require('./package.json');

require('yargs')
    .version(config.version)
    .usage('Usage: $0 <command> [options]')
    .commandDir('commands')
    .demandCommand(1, 'You need at least one command before moving on')
    .help('h')
    .alias('h', 'help')
    .alias('v', 'version')
    .parse();
