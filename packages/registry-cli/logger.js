const config = require('./package.json')
const loglevel = require('loglevelnext');
const chalk = require('chalk');

const colors = {
    trace: 'cyan',
    debug: 'magenta',
    info: 'blue',
    warn: 'yellow',
    error: 'red'
};

module.exports = loglevel.create({
    level: 'info',
    timestamp: false,
    name: config.name,
    prefix: {
        level: ({ level }) => {
            const color = colors[level];

            return chalk[color](`[${level}] `);
        },
        template: '{{level}}'
    }
});
