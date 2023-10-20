const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');

const logger = require('../logger');
const utils = require('../utils');

module.exports = {
    command: 'build <path>',
    desc: 'build template builder component',
    builder(yargs) {
        return yargs
            .positional('path', {
                desc: 'Path to template builder component',
                type: 'string',
                coerce(arg) {
                    const resolvedPath = path.resolve(process.cwd(), arg);

                    if (!fs.existsSync(resolvedPath)) {
                        throw new Error(`${chalk.red.bold(arg)} is not exists`);
                    }

                    return {
                        dir: resolvedPath,
                        config: utils.resolveConfig(resolvedPath)
                    };
                }
            })
            .option('source-map', {
                type: 'boolean',
                alias: 'm',
                default: false
            })
            .option('watch', {
                type: 'boolean',
                default: false
            })
            .option('analyze', {
                type: 'boolean',
                alias: 'a',
                default: false
            });
    },
    handler({ path: { dir, config }, watch, sourceMap, analyze }) {
        logger.info(`resolved template builder component config by path`, chalk.magenta(dir));
        logger.info(config);

        logger.info(`clearing dist folder`);
        fs.emptyDirSync(path.join(dir, 'dist'));
        logger.info(`prepare complier`);
        const compilers = utils.createCompilers(dir, config, { sourceMap, analyze });
        const compilationDone = Array(compilers.length).fill(false);

        const statsCallback = (err, stats) => {
            if (err) {
                logger.error(err.stack || err);
                if (err.details) {
                    logger.error(err.details);
                }

                if (!watch) process.exit(1);

                return;
            }

            if (stats.hasWarnings()) {
                stats.compilation.warnings.forEach((warning) => {
                    process.stdout.write('\n\n');

                    if (warning.message) {
                        logger.warn(warning.message);
                        process.stdout.write('\n');
                        logger.debug(warning.stack);

                        return;
                    }
                    logger.warn(warning);
                });
                process.stdout.write('\n');
            }

            if (stats.hasErrors()) {
                stats.compilation.errors.forEach((err) => {
                    if (err.module) {
                        logger.warn(err.module.resource);
                    }
                    if (err.message) {
                        process.stdout.write('\n');
                        logger.error(err.message);
                    }
                });
            }

            if (stats.hasErrors()) {
                if (!watch) process.exit(1);

                return;
            }

            const done = compilationDone.filter(Boolean).length;

            logger.info(chalk.green(`build ${done + 1}/${compilationDone.length}`));

            if (compilationDone.every(Boolean)) {
                if (!watch) process.exit(0);
            } else {
                compilationDone[done] = true;
            }
        };

        if (watch) {
            logger.info(`start in watch mode`);
            for (const compiler of compilers) {
                compiler.watch(
                    {
                        aggregateTimeout: 300,
                        poll: undefined
                    },
                    (err, stats) => {
                        statsCallback(err, stats);
                    }
                );
            }
        } else {
            logger.info(`build started`);
            for (const compiler of compilers) {
                compiler.run((err, stats) => {
                    statsCallback(err, stats);
                });
            }
        }
    }
};
