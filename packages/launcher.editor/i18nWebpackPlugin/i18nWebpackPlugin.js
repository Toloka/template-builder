/* eslint-disable no-loop-func */
const validateOptions = require('schema-utils');
const fs = require('fs-extra');
const path = require('path');
const { DefinePlugin } = require('webpack');
const loaderUtils = require('loader-utils');

const schema = {
    type: 'object',
    properties: {
        src: {
            type: 'string'
        }
    }
};

const flatDir = (absPath, relativePath = '') => {
    const absResult = [];
    const relativeResult = [];
    const items = fs.readdirSync(absPath);

    for (const item of items) {
        const itemAbsPath = path.resolve(absPath, item);
        const itemRelativePath = [relativePath, item].filter(Boolean).join('/');

        if (fs.lstatSync(path.resolve(absPath, item)).isDirectory()) {
            const sub = flatDir(itemAbsPath, itemRelativePath);

            absResult.push(...sub.absResult);
            relativeResult.push(...sub.relativeResult);
        } else {
            absResult.push(itemAbsPath);
            relativeResult.push(itemRelativePath);
        }
    }

    return { absResult, relativeResult };
};

function interpolateHashes(filename, source) {
    return filename.replace(/\[(?:(\w+):)?contenthash(?::([a-z]+\d*))?(?::(\d+))?\]/gi, (...match) => {
        const [, hashType, digestType, maxLength] = match;

        return loaderUtils.getHashDigest(source, hashType, digestType, Number.parseInt(maxLength, 10));
    });
}

module.exports = class I18nWebpackPlugin {
    constructor(options = {}) {
        this.options = options;
        validateOptions(schema, options, 'i18nWebpackPlugin');
    }
    apply(compiler) {
        const assetsMap = {};
        const assetsData = {};
        const assets = flatDir(this.options.src);

        for (let i = 0; i < assets.absResult.length; i++) {
            const absPath = assets.absResult[i];
            const baseRelativePath = assets.relativeResult[i].replace(/\.json$/, '');
            const chunkName = baseRelativePath.replace(/\//g, '.');
            const data = fs.readFileSync(absPath);
            const hashedPath = interpolateHashes(`${chunkName}.[contenthash].json`, data);

            assetsData[hashedPath] = data;
            assetsMap[baseRelativePath] = hashedPath;
        }

        const definePlugin = new DefinePlugin({ __i18nWebpackPluginAssetsMap__: `'${JSON.stringify(assetsMap)}'` });

        definePlugin.apply(compiler);

        compiler.hooks.compilation.tap({ name: 'i18nWebpackPlugin' }, (compilation) => {
            compilation.hooks.additionalAssets.tapAsync('i18nWebpackPlugin', async (callback) => {
                for (const path in assetsData) {
                    compilation.emitAsset(path, {
                        source() {
                            return assetsData[path];
                        },
                        size() {
                            return assetsData[path].length;
                        }
                    });
                }
                callback();
            });
        });
    }
};
