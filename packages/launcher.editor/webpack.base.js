const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin;
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const RetryEnsureWebpackPlugin = require('retry-ensure-webpack-plugin').RetryEnsureWebpackPlugin;
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const postCssLoader = {
    loader: 'postcss-loader',
    options: require('@toloka-tb/postcss-config')
};

module.exports = (env = {}, options) => ({
    module: {
        rules: [
            {
                test: /\.([tj])sx?$/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: [require('@toloka-tb/babel-preset')]
                        }
                    }
                ],
                exclude: /node_modules/
            },
            {
                test: /\.less$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 2,
                            modules: {
                                localIdentName:
                                    options.mode === 'production'
                                        ? '[contenthash:base64:5]'
                                        : '[local]_[contenthash:base64:5]'
                            }
                        }
                    },
                    postCssLoader,
                    {
                        loader: 'less-loader',
                        options: {
                            modules: true
                        }
                    }
                ],
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 2
                        }
                    },
                    postCssLoader
                ]
            },
            // monaco editor
            {
                test: /node_modules\/monaco-editor\/.*\.ttf$/,
                use: ['file-loader']
            },

            {
                test: /(node_modules\/(@yandex\/ui)|(assets))\/.*\.svg$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            mimetype: 'image/svg+xml'
                        }
                    }
                ]
            },
            {
                test: /node_modules\/(@yandex\/ui)\/.*\.(ttf|woff(2)?|png|gif)$/,
                use: 'url-loader'
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.less']
    },

    mode: 'development',
    devtool: 'source-map',

    devServer: {
        hot: false,
        inline: false,
        // TODO: remove relative dist
        contentBase: path.resolve(__dirname, '../../dist'),
        headers: {
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
            'Access-Control-Allow-Origin': '*'
        }
    },

    plugins: [
        new CleanWebpackPlugin(),
        ...(env.analyze ? [new BundleAnalyzerPlugin()] : []),
        ...(process.stdin.isTTY ? [new webpack.ProgressPlugin()] : []),
        new webpack.DefinePlugin({
            'process.env.TB_LIBS': `'${options.mode}'`
        }),
        new RetryEnsureWebpackPlugin(),
        ...(options.mode === 'production' ? [new ForkTsCheckerWebpackPlugin()] : [])
    ],

    stats: 'minimal'
});
