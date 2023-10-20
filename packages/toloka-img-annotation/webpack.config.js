const DeadCodePlugin = require('webpack-deadcode-plugin');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

module.exports = {
    mode: 'production',
    node: false,
    entry: {
        'image-annotation-editor': './src/index.js'
    },
    output: {
        path: __dirname,
        filename: 'build/[name].bundle.js',
        libraryTarget: "umd"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    plugins: [
                        "lodash",
                    ],
                }
            },
            {
                test: /\.html$/,
                loader: 'html-loader',
                query: {
                    interpolate: true
                }
            },
            {
                test: /\.svg$/,
                loader: 'raw-loader'
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: 'style-loader'
                    },
                    {
                        loader: 'css-loader'
                    }
                ],
            }
        ]
    },
    plugins: [
        new DeadCodePlugin({
            patterns: [
                'src/**/*.(js|css)',
            ],
            exclude: [
                '**/*.(spec).(js|jsx)',
            ],
        }),
        new LodashModuleReplacementPlugin()
    ]
};
