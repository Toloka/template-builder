import { makePluginSchema } from '@toloka-tb/schemas/make';

import keys from './keys.json';

const metaKeys = [''];

const hotkeys: { [key: string]: { $ref: string } } = {};

for (const meta of metaKeys) {
    for (const key of keys) {
        hotkeys[[meta, key].filter((a) => a !== '').join('+')] = {
            $ref: '#/definitions/action'
        };
    }
}

export const schema = makePluginSchema('plugin.hotkeys', {
    schema: {
        properties: {
            ...hotkeys,
            allowHotkeysInInputs: { type: 'boolean', default: false }
        },
        required: ['type'],
        default: { type: 'plugin.hotkeys' }
    }
});
