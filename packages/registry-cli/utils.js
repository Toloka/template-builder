const path = require('path');
const fs = require('fs-extra');
const semver = require('semver');
const chalk = require('chalk');
const webpack = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const merge = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackDynamicPublicPathPlugin = require('webpack-dynamic-public-path');
const ManifestPlugin = require('webpack-manifest-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const baseComponentsConfig = require('./webpack.base');

const componentRegex = /(^@toloka-tb\/core$|^@([a-z-]+)\/(action|field|view|plugin|layout|data|helper|condition|lib)\.([a-z-]+))/i;

const isComponent = (packageName) => componentRegex.test(packageName);

const removeDefaultServiceScope = (packageName) => {
    if (!isComponent(packageName)) {
        throw new Error(`${chalk.bold(packageName)} is not template builder component`);
    }

    if (packageName.startsWith('@toloka-tb')) {
        return packageName.split('/')[1];
    }

    return packageName;
};

const readDirRecursevely = (entryDirPath, pathPrefix) => {
    const result = {};
    const traverse = (parentPath) => {
        const children = fs.readdirSync([entryDirPath, parentPath].filter(Boolean).join('/'));

        for (const child of children) {
            if (fs.statSync([entryDirPath, parentPath, child].filter(Boolean).join('/')).isDirectory()) {
                traverse([parentPath, child].filter(Boolean).join('/'));
            } else {
                result[[parentPath, child].filter(Boolean).join('/')] = true;
            }
        }
    };

    traverse();

    return Object.keys(result).map((path) => `${pathPrefix}/${path}`);
};

const resolveConfig = (dir) => {
    const packageJsonPath = path.join(dir, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
        throw new Error(`${chalk.bold(packageJsonPath)} is not exists`);
    }

    const packageConfig = require(packageJsonPath);

    if (!isComponent(packageConfig.name)) {
        throw new Error(`${chalk.red(packageConfig.name)} must starts with ${componentRegex.toString()}`);
    }

    if (!semver.valid(packageConfig.version)) {
        throw new Error(`${chalk.red(packageConfig.version)} is not valid semver version`);
    }

    const main = path.join(dir, packageConfig.main);

    if (!fs.existsSync(main)) {
        throw new Error(`${chalk.bold(path.join(dir, packageConfig.main))} is not exists`);
    }

    const editor = path.join(dir, `${packageConfig.main.replace(/\.tsx?$/, '')}.editor.ts`);

    const i18nEntries = fs.existsSync(path.join(dir, '/i18n'))
        ? readDirRecursevely(path.join(dir, '/i18n'), 'i18n').filter((path) => path.split('/').length === 3)
        : null;

    return {
        type: removeDefaultServiceScope(packageConfig.name),
        version: packageConfig.version,
        main,
        editor: fs.existsSync(editor) ? editor : null,
        i18nEntries,
        dependencies: Object.keys(packageConfig.dependencies || {}).reduce((dependencies, dependency) => {
            if (!isComponent(dependency)) return dependencies;
            dependencies[removeDefaultServiceScope(dependency)] = packageConfig.dependencies[dependency];

            return dependencies;
        }, {})
    };
};

const emptyConfig = () => {
    /* empty webpack config */
};

const createCompilers = (dir, config, { sourceMap, analyze } = {}) => {
    const webpackPatchPath = path.join(dir, 'webpack.config.js');
    const patch = fs.existsSync(webpackPatchPath) ? require(webpackPatchPath) : emptyConfig;
    const slashEscapedType = config.type.replace(/\//g, '_');

    const commonConfig = merge(
        baseComponentsConfig({}, {}),
        {
            optimization: {
                noEmitOnErrors: false
            },
            externals: [
                {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    'react-intl': 'ReactIntl',
                    mobx: 'mobx'
                },
                (_, request, callback) => {
                    if (isComponent(request)) {
                        const type = removeDefaultServiceScope(request);

                        if (type in config.dependencies) {
                            return callback(null, `window tb-${type}@${config.dependencies[type]}`);
                        } else {
                            return callback(`add ${request} as dependency in ${dir}/package.json`);
                        }
                    }

                    callback();
                }
            ],
            mode: 'production',
            entry: {
                // [slashEscapedType]: config.main,
                // ...editorEntry
            },
            output: {
                library: undefined, // `tb-real-[name]@${config.version}`,
                path: undefined, // path.join(dir, 'dist'),
                filename: undefined, // '[name].[contenthash].js',
                libraryTarget: 'window',
                publicPath: '__PUBLIC_PATH_FOR_REPLACE__'
            },
            plugins: [
                ...(analyze ? [new BundleAnalyzerPlugin({ analyzerMode: 'static' })] : []),
                new ForkTsCheckerWebpackPlugin(),
                new WebpackDynamicPublicPathPlugin({
                    externalPublicPath:
                        'window.document && document.currentScript ? document.currentScript.src.slice(0, document.currentScript.src.lastIndexOf("/") + 1) : ""'
                })
            ],
            devtool: sourceMap ? 'source-map' : 'hidden-source-map'
        },
        patch(),
        {
            stats: 'minimal',
            resolveLoader: {
                // by default webpack resolve loaders from present working directory
                // so we need to configure that to resolve loaders from `registry-cli` dependencies
                modules: [path.resolve(__dirname, 'node_modules')]
            }
        }
    );

    // eslint-disable-next-line max-params
    const createConfig = (entry, outputFileName, onWindowName, manifestPostfix) =>
        merge(commonConfig, {
            entry: { main: entry },
            output: {
                library: `tb-real-${onWindowName}@${config.version}`,
                path: path.join(dir, 'dist'),
                filename: `${outputFileName}.[contenthash].js`,
                chunkFilename: `chunk-[id].${outputFileName}.[contenthash].js`
            },
            plugins: [
                new MiniCssExtractPlugin({
                    filename: `${outputFileName}.[contenthash].css`,
                    chunkFilename: `chunk-[id].${outputFileName}.[contenthash].css`,
                    ignoreOrder: false
                }),
                new ManifestPlugin({
                    fileName: `manifest-${manifestPostfix}.json`,
                    publicPath: ''
                })
            ]
        });

    const configs = [];

    configs.push(createConfig(config.main, slashEscapedType, config.type, 'main'));

    if (config.editor) {
        configs.push(createConfig(config.editor, `editor-${slashEscapedType}`, `editor-${config.type}`, 'editor'));
    } else {
        // TODO: warn about miss of [entry].editor.ts
    }
    if (config.i18nEntries) {
        for (const i18nEntry of config.i18nEntries) {
            const isEditorEntry = i18nEntry.endsWith('.editor.json');

            if (!isEditorEntry) {
                continue;
            }
            const lang = i18nEntry.split('/').slice(-2, -1)[0]; // second item from the end
            const usecase = 'editor';
            const manifestPostfix = `i18n-${lang}-${usecase}`;

            configs.push(
                createConfig(
                    path.join(dir, i18nEntry),
                    manifestPostfix,
                    `i18n/${lang}/${config.type}.${usecase}`,
                    manifestPostfix
                )
            );
        }
    }

    return configs.map((config) => webpack(config));
};

module.exports = {
    resolveConfig,
    isComponent,
    getType: removeDefaultServiceScope,
    createCompilers
};
