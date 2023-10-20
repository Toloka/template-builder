module.exports = {
    transform: {
        '^.+\\.tsx?$': 'babel-jest',
        '^.+\\.jsx?$': 'babel-jest'
    },
    transformIgnorePatterns: ['/node_modules/(?!(monaco-editor)/)'],

    testRegex: '\\.test\\.tsx?$',

    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

    moduleNameMapper: {
        // TODO: until we publish our packages to npm we have conflict of react and react-dom versions in tests
        '^react$': '<rootDir>/node_modules/react',
        '^react-dom$': '<rootDir>/node_modules/react-dom'
    },

    testURL: 'http://localhost/'
};
