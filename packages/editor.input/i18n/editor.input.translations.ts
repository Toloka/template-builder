import langJson from '@toloka-tb/lang.json/i18n/lang.json.translations';

import en from './en/editor.input.json';
import ru from './ru/editor.input.json';

const translations = {
    en: {
        ...langJson.en,
        ...en
    },
    ru: {
        ...langJson.ru,
        ...ru
    }
};

export default translations;
