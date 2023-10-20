const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const storages = require('../storages');

const logger = require('../logger');
const utils = require('../utils');

module.exports = {
    command: 'publish <path>',
    desc: 'publish template builder component',
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
            .option('watch', {
                type: 'boolean',
                alias: 'w',
                default: false
            })
            .option('analyze', {
                type: 'boolean',
                alias: 'a',
                default: false
            })
            .option('source-map', {
                type: 'boolean',
                alias: 'm',
                default: false
            })
            .option('build', {
                type: 'boolean',
                alias: 'b',
                default: true
            })
            .option('storage-config', {
                type: 'string',
                alias: 'sc',
                coerce(arg) {
                    const resolvedPath = path.resolve(process.cwd(), arg);

                    if (!fs.existsSync(resolvedPath)) {
                        throw new Error(`${chalk.red.bold(arg)} is not exists`);
                    }

                    let config = null;

                    try {
                        config = require(resolvedPath);
                    } catch {
                        config = fs.readJSONSync(resolvedPath, { throws: false });
                    }

                    if (config === null) {
                        throw new Error(`${chalk.red.bold(arg)} is not valid json or requireable file`);
                    }

                    const allowedStorages = Object.keys(storages);

                    if (!allowedStorages.includes(config.type)) {
                        throw new Error(
                            `Unknown storage type ${chalk.bold(config.type)} (allowed ${chalk.bold(
                                allowedStorages.join(', ')
                            )})`
                        );
                    }

                    return config;
                }
            });
    },
    handler({ path: { dir, config }, watch, analyze, build, storageConfig, sourceMap }) {
        // TODO: rework
        if (storageConfig.type === 's3' && watch) {
            throw new Error(`S3 storage type with watch mode are not allowed together`);
        }

        logger.info(`resolved template builder component config by path`, chalk.magenta(dir));
        logger.info(config);

        function handleErr(err) {
            logger.error(err.stack || err);
            if (err.details) {
                logger.error(err.details);
            }

            if (!watch) process.exit(1);
        }

        function publish() {
            logger.info(`prepare publish to ${storageConfig.type}`);
            const storage = new storages[storageConfig.type](storageConfig);

            storage.prepare(config, path.join(dir, 'dist'), (err) => {
                if (err) {
                    handleErr(err);

                    return;
                }
                logger.info(`publish to ${storageConfig.type}`);
                storage.publish((err) => {
                    if (err) {
                        handleErr(err);

                        return;
                    }

                    logger.info(chalk.green('success published 🚀'));
                    if (!watch) process.exit(0);
                });
            });
        }

        if (!build) {
            publish();
        } else {
            logger.info(`clearing dist folder`);
            fs.emptyDirSync(path.join(dir, 'dist'));
            logger.info(`prepare compiler`);
            const compilers = utils.createCompilers(dir, config, { sourceMap, analyze });
            const compilationDone = Array(compilers.length).fill(false);

            logger.info('compiler prepare done');

            const statsCallback = (err, stats) => {
                if (err) {
                    handleErr(err);

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

                if (done + 1 === compilationDone.length) {
                    logger.info('build done, publishing');
                    publish();
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
    }
};
