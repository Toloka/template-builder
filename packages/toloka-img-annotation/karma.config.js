const _ = require('lodash');
const webpack = require('karma-webpack');
const webpackConfig = require('./webpack.config');


module.exports = function (config) {
    config.set({
        frameworks: ['jasmine'],
        files: [
            'tests/**/*.spec.js',
            { pattern: 'tests/_assets/**/*', included: false }
        ],
        plugins: [webpack, 'karma-jasmine', 'karma-chrome-launcher'],
        browsers: ['Chromium'],
        preprocessors: {
            'tests/**/*.spec.js': ['webpack']
        },
        webpack: _.omit(webpackConfig, 'entry', 'output')
    });
};
