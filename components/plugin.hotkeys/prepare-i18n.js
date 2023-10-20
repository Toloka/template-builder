/* eslint-disable max-depth */
const fs = require('fs');
const path = require('path');
const langs = fs.readdirSync(path.resolve(__dirname, 'i18n'));
const hotkeys = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'keys.json'), 'utf-8'));

for (const lang of langs) {
    if (!lang.startsWith('.')) {
        const keysets = fs.readdirSync(path.resolve(__dirname, 'i18n', lang), 'utf-8');

        for (const keyset of keysets) {
            const content = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'i18n', lang, keyset)));

            if ('propertiesDocsDescription' in content) {
                for (const hotkey of hotkeys) {
                    content[`properties.${hotkey}.description`] = content['propertiesDocsDescription'];
                }
            }

            fs.writeFileSync(path.resolve(__dirname, 'i18n', lang, keyset), JSON.stringify(content));
        }
    }
}
