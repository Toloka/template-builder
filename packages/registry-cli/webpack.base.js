const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const RetryEnsureWebpackPlugin = require('retry-ensure-webpack-plugin').RetryEnsureWebpackPlugin;

const postCssLoader = {
    loader: 'postcss-loader',
    options: require('@toloka-tb/postcss-config')
};

module.exports = (_, options) => ({
    module: {
        rules: [
            {
                test: /\.(t|j)sx?$/,
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
                ]
            },
            {
                test: /\.css$/,
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
                    postCssLoader
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
                    }
                ],
                include: /node_modules/
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

    plugins: [
        ...(process.stdin.isTTY ? [new webpack.ProgressPlugin()] : []),
        new webpack.DefinePlugin({
            'process.env.TB_LIBS': `'${options.mode}'`
        }),
        new RetryEnsureWebpackPlugin()
    ],

    stats: 'minimal'
});
