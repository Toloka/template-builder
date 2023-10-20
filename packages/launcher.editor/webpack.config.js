const freezePath = 'https://tlkfrontprod.azureedge.net/template-builder-production/launcher.editor/';
const I18NextWebpackPlugin = require('./i18nWebpackPlugin/i18nWebpackPlugin');

const { resolve } = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const merge = require('webpack-merge');
const common = require('./webpack.base.js');

const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const root = resolve(__dirname, '../../');

module.exports = (env = {}, options) =>
    merge(common(env, options), {
        externals: [
            {
                react: 'React',
                'react-dom': 'ReactDOM',
                mobx: 'mobx',
                'react-intl': 'ReactIntl'
            }
        ],
        entry: {
            editor: resolve(__dirname, './launcher.editor.ts')
        },
        output: {
            path: `${__dirname}/dist`,
            globalObject: 'this',
            chunkFilename: '[name].[contenthash].js',
            filename: '[name].[contenthash].js',
            publicPath: options.mode === 'production' ? freezePath : undefined
        },
        devtool: options.mode === 'production' ? false : 'source-map',
        plugins: [
            new MiniCssExtractPlugin({
                filename: `[name].[contenthash].css`,
                ignoreOrder: false
            }),
            new MonacoWebpackPlugin({
                languages: ['javascript', 'json'],
                filename: '[name].monaco.[contenthash].js'
            }),
            new HtmlWebpackPlugin({
                title: 'Template Builder Editor',
                template: `${__dirname}/launcher.editor.html`
            }),
            new I18NextWebpackPlugin({
                src: `${__dirname}/i18n`
            })
        ].concat(
            options.mode !== 'production'
                ? [
                      new webpack.DefinePlugin({
                          'window.TB_REGISTRY_URL': JSON.stringify(env.registry ? env.registry : '/'),
                          'window.DOC_BASE_URL': JSON.stringify('https://toloka.ai/docs/template-builder')
                      })
                  ]
                : []
        ),
        devServer: {
            contentBase: [`${root}/dist`],
            proxy: {
                '/resolve': 'http://127.0.0.1:3000',
                '/latest': 'http://127.0.0.1:3000',
            },
            port: 8080
        }
    });
