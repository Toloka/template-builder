const { configure } = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');

module.exports = async () => {
    configure({ adapter: new Adapter() });
};

global.__webpack_public_path__ = 'http://localhost';
global.__i18nWebpackPluginAssetsMap__ = '{}';
