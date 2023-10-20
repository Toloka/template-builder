const chalk = require('chalk');
const path = require('path');
const url = require('url');
const fs = require('fs-extra');

module.exports = class BaseStorage {
    constructor(config) {
        this.config = config;
        this.meta = null;
    }

    prepare(config, dist, callback) {
        if (!fs.existsSync(dist)) {
            callback(new Error(`${chalk.red(dist)} does not exists. Try to build first`));

            return;
        }

        const distFiles = fs.readdirSync(dist);
        const manifestFiles = distFiles.filter(
            (fileName) => fileName.startsWith('manifest-') && fileName.endsWith('.json')
        );

        const manifests = manifestFiles.map((fileName) => ({
            fileName,
            content: fs.readJsonSync(path.resolve(dist, fileName))
        }));

        const manifestContent2chunkUrls = (content) =>
            Object.entries(content)
                .filter(
                    ([manifestKey, manifestValue]) =>
                        !manifestKey.startsWith('runtime~') && !manifestValue.endsWith('.map')
                )
                .map(([, manifestValue]) => ({
                    basename: manifestValue,
                    url: url.resolve(this.config.url, manifestValue)
                }))
                .reduce(
                    (result, { basename, url }) => ({ ...result, [path.join(dist, basename)]: { basename, url } }),
                    {}
                );

        const mainManifest = manifests.find((manifest) => manifest.fileName === 'manifest-main.json');
        const editorManifest = manifests.find((manifest) => manifest.fileName === 'manifest-editor.json');
        const i18nManifests = manifests.filter((manifest) => manifest.fileName.startsWith('manifest-i18n'));

        const i18n = {};

        for (const manifest of i18nManifests) {
            const cutName = manifest.fileName.replace(/^manifest-i18n-/, '').replace(/\.json$/, '');
            const [lang, usecase] = cutName.split('-');

            i18n[lang] = i18n[lang] || {};
            i18n[lang][usecase] = manifestContent2chunkUrls(manifest.content);
        }

        this.meta = {
            type: config.type,
            version: config.version,
            dependencies: { ...config.dependencies },
            links: manifestContent2chunkUrls(mainManifest.content),
            editorLinks: editorManifest ? manifestContent2chunkUrls(editorManifest.content) : {},
            i18nLinks: i18n
        };

        callback(null);
    }

    publish(callback) {
        if (this.meta === null) {
            callback(new Error(`Before publish need to prepare`));

            return;
        }

        this._publish(callback);
    }
};
