module.exports = {
    transform: {
        '^.+\\.tsx?$': 'babel-jest',
        '^.+\\.jsx?$': 'babel-jest'
    },

    testRegex: '\\.test\\.tsx?$',

    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

    testURL: 'http://localhost/'
};
