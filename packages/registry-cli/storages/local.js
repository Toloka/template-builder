const chalk = require('chalk');
const path = require('path');
const fs = require('fs-extra');
const BaseStorage = require('./base-storage');

const copyAssetSync = (pathFrom, pathTo) => {
    fs.copyFileSync(pathFrom, pathTo);
    const sourceMapsPath = `${pathFrom}.map`;

    if (fs.existsSync(sourceMapsPath)) {
        fs.copyFileSync(sourceMapsPath, `${pathTo}.map`);
    }
};

module.exports = class LocalStorage extends BaseStorage {
    _publish(callback) {
        try {
            fs.ensureDirSync(this.config.distPath);

            Object.keys(this.meta.links).forEach((file) => {
                copyAssetSync(file, path.join(this.config.distPath, this.meta.links[file].basename));
            });
            Object.keys(this.meta.editorLinks).forEach((file) => {
                copyAssetSync(file, path.join(this.config.distPath, this.meta.editorLinks[file].basename));
            });
            Object.keys(this.meta.i18nLinks).forEach((lang) => {
                Object.keys(this.meta.i18nLinks[lang]).forEach((keyset) => {
                    Object.keys(this.meta.i18nLinks[lang][keyset]).forEach((file) => {
                        copyAssetSync(
                            file,
                            path.join(this.config.distPath, this.meta.i18nLinks[lang][keyset][file].basename)
                        );
                    });
                });
            });
        } catch (e) {
            e.details = `Cannot copy files to ${chalk.bold(this.config.distPath)}`;
            callback(e);

            return;
        }

        const typePath = path.join(this.config.metaPath, this.meta.type);

        const metaFile = path.join(typePath, `${this.meta.version}.json`);

        try {
            fs.ensureDirSync(typePath);

            const i18nLinks = {};

            for (const lang in this.meta.i18nLinks) {
                i18nLinks[lang] = {};
                for (const keyset in this.meta.i18nLinks[lang]) {
                    i18nLinks[lang][keyset] = Object.values(this.meta.i18nLinks[lang][keyset]).map((info) => info.url);
                }
            }

            fs.writeJSONSync(
                metaFile,
                {
                    ...this.meta,
                    links: Object.values(this.meta.links).reduce((links, info) => {
                        if (info.basename.endsWith('.map')) return links;

                        links.push(info.url);

                        return links;
                    }, []),
                    editorLinks: Object.values(this.meta.editorLinks).reduce((links, info) => {
                        if (info.basename.endsWith('.map')) return links;

                        links.push(info.url);

                        return links;
                    }, []),
                    i18nLinks
                },
                { spaces: 2 }
            );
        } catch (e) {
            e.details = `Cannot write meta info to ${chalk.bold(metaFile)}`;
            callback(e);

            return;
        }

        callback(null);
    }
};
