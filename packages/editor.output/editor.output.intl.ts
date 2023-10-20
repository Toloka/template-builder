import { MessageDescriptor } from 'react-intl';

import translations from './i18n/editor.output.translations';

// weird code to map translation messages to react-intl format & use them comfortably
export const key: { [K in keyof typeof translations.ru]: MessageDescriptor } = {} as any;

for (const objKey of Object.keys(translations.ru)) {
    const tKey = objKey as keyof typeof translations.ru;

    key[tKey] = { id: tKey };
}
