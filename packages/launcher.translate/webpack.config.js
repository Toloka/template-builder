const freezePath = 'https://tlkfrontprod.azureedge.net/template-builder-production/launcher.translate/';
const path = require('path');

const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.base');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

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
            'launcher.translate': path.resolve(__dirname, 'launcher.translate.ts')
        },
        output: {
            path: path.resolve(__dirname, 'dist'),
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
            new HtmlWebpackPlugin({
                title: 'Template',
                template: `${__dirname}/launcher.translate.html`
            })
        ].concat(
            options.mode !== 'production'
                ? [
                      new webpack.DefinePlugin({
                          'window.TB_REGISTRY_URL': JSON.stringify(env.registry ? env.registry : '/')
                      })
                  ]
                : []
        ),
        devServer: {
            liveReload: true,
            historyApiFallback: false,
            contentBase: [__dirname, path.resolve(__dirname, '../../dist')],
            proxy: {
                '/resolve': 'http://127.0.0.1:3000',
                '/latest': 'http://127.0.0.1:3000'
            },
            port: 8086
        }
    });
