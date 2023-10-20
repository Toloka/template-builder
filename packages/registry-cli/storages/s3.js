const chalk = require('chalk');
const path = require('path');
const fs = require('fs-extra');
const aws = require('aws-sdk');
const mime = require('mime-types');
const zlib = require('zlib');
const BaseStorage = require('./base-storage');
const logger = require('../logger');

module.exports = class S3Storage extends BaseStorage {
    _isAllowedBasename(basename) {
        return /\.(js|css)$/.test(basename);
    }

    _publish(callback) {
        const s3 = new aws.S3({
            endpoint: this.config.endpoint,
            accessKeyId: this.config.accessKeyId,
            secretAccessKey: this.config.accessSecretKey,
            logger
        });

        const typeWithVersion = `${this.meta.type}@${this.meta.version}`;
        const metaPath = path.join(this.config.metaPath, this.meta.type, `${this.meta.version}.json`);

        const uploadMeta = (callback) => {
            logger.info('upload meta');

            const i18nLinks = {};

            for (const lang in this.meta.i18nLinks) {
                i18nLinks[lang] = {};
                for (const keyset in this.meta.i18nLinks[lang]) {
                    i18nLinks[lang][keyset] = Object.values(this.meta.i18nLinks[lang][keyset]).map((info) => info.url);
                }
            }

            s3.putObject(
                {
                    Bucket: this.config.bucket,
                    Key: metaPath,
                    Body: JSON.stringify({
                        ...this.meta,
                        links: Object.values(this.meta.links).map((info) => info.url),
                        editorLinks: Object.values(this.meta.editorLinks).map((info) => info.url),
                        i18nLinks
                    })
                },
                (err) => {
                    if (err) {
                        err.details = `Unknown S3 error`;
                        callback(err);

                        return;
                    }
                    callback(null);
                }
            );
        };

        const uploadFiles = (callback) => {
            const data = [].concat(Object.entries(this.meta.links), Object.entries(this.meta.editorLinks));

            const uploadNext = () => {
                if (data.length === 0) {
                    callback(null);

                    return;
                }

                const [file, info] = data.shift();
                let fileContent = file;

                if (typeof fileContent === 'string') {
                    try {
                        fileContent = fs.readFileSync(file);
                    } catch (err) {
                        err.details = `Cannot read file ${chalk.bold(file)}`;
                        callback(err);

                        return;
                    }
                }

                const key = path.join(this.config.distPath, info.basename);

                s3.getObject(
                    {
                        Bucket: this.config.bucket,
                        Key: key
                    },
                    (err) => {
                        if (err && err.code !== 'NoSuchKey') {
                            err.details = `Unknown S3 error`;
                            callback(err);

                            return;
                        }

                        if (!err) {
                            logger.warn(`${chalk.bold(key)} already exists`);
                            uploadNext();

                            return;
                        }

                        const contentEncodingRegexp = /.(br|gz)$/;
                        const isCompressed = contentEncodingRegexp.test(info.basename);

                        const contentType = mime.lookup(info.basename.replace(contentEncodingRegexp, ''));

                        s3.putObject(
                            {
                                Bucket: this.config.bucket,
                                Key: key,
                                Body: fileContent,
                                ContentType: contentType,
                                ContentEncoding: isCompressed ? contentEncodingRegexp.exec(info.basename)[1] : undefined
                            },
                            (err) => {
                                if (err) {
                                    err.details = `Unknown S3 error`;
                                    callback(err);

                                    return;
                                }

                                try {
                                    if (!isCompressed) {
                                        data.unshift(
                                            [
                                                zlib.gzipSync(fileContent),
                                                {
                                                    basename: `${info.basename}.gz`,
                                                    url: `${info.url}.gz`
                                                }
                                            ],
                                            [
                                                zlib.brotliCompressSync(fileContent),
                                                {
                                                    basename: `${info.basename}.br`,
                                                    url: `${info.url}.br`
                                                }
                                            ]
                                        );
                                    }
                                } catch (e) {
                                    e.details = `Cannot compress ${chalk.bold(file)}`;
                                    callback(e);

                                    return;
                                }

                                uploadNext();
                            }
                        );
                    }
                );
            };

            uploadNext();
        };

        const checkVersionExists = (callback) => {
            s3.getObject(
                {
                    Bucket: this.config.bucket,
                    Key: metaPath
                },
                (err) => {
                    if (err) {
                        if (err.code === 'NoSuchKey') {
                            callback(null);
                        } else {
                            err.details = `Unknown S3 error`;
                            callback(err);
                        }

                        return;
                    }

                    callback(`${chalk.bold(typeWithVersion)} already exists`);
                }
            );
        };

        logger.info('check s3 config');
        s3.headBucket({ Bucket: this.config.bucket }, (err) => {
            if (err) {
                switch (err.code) {
                    case 'UnknownEndpoint':
                        callback(`${chalk.bold(this.config.endpoint)} is wrong endpoint`);
                        break;
                    case 'NotFound':
                        callback(`${chalk.bold(this.config.bucket)} is wrong bucket`);
                        break;
                    case 'Forbidden':
                        callback(`Wrong ${chalk.bold('accessKeyId')} or ${chalk.bold('secretAccessKey')}`);
                        break;
                    default:
                        err.details = `Unknown S3 error`;
                        callback(err);
                }

                return;
            }
            logger.info(chalk.green('success checked s3 config'));

            logger.info(`check exists of ${chalk.bold(typeWithVersion)}`);
            checkVersionExists((err) => {
                if (err) return callback(err);
                logger.info(chalk.green(`${chalk.bold(typeWithVersion)} not exists`));

                logger.info('upload files');
                uploadFiles((err) => {
                    if (err) return callback(err);
                    logger.info(chalk.green('success uploaded files'));

                    uploadMeta(callback);
                });
            });
        });
    }
};
