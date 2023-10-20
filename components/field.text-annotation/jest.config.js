module.exports = {
    transform: {
        '^.+\\.tsx?$': 'babel-jest',
        '^.+\\.jsx?$': 'babel-jest'
    },
    transformIgnorePatterns: ['/node_modules/(?!(monaco-editor)/)'],

    testRegex: '\\.test\\.tsx?$',

    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

    moduleNameMapper: {
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/jest/fileMock.js',
        '\\.(css|less)$': '<rootDir>/jest/styleMock.js',
        // TODO: until we publish our packages to npm we have conflict of react and react-dom versions in tests
        '^react$': '<rootDir>/node_modules/react',
        '^react-dom$': '<rootDir>/node_modules/react-dom'
    },

    setupFiles: ['<rootDir>/jest/setup.js'],

    globalSetup: '<rootDir>/jest/setup.js',

    testURL: 'http://localhost/'
};
