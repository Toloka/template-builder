import editorInput from '@toloka-tb/editor.input/i18n/editor.input.translations';
import editorOutput from '@toloka-tb/editor.output/i18n/editor.output.translations';
import editorPreview from '@toloka-tb/editor.preview/i18n/editor.preview.translations';

import en from './en/launcher.translate.json';
import ru from './ru/launcher.translate.json';

const translations = {
    en: {
        ...editorPreview.en,
        ...editorInput.en,
        ...editorOutput.en,
        ...en
    },
    ru: {
        ...editorPreview.ru,
        ...editorInput.ru,
        ...editorOutput.ru,
        ...ru
    }
};

export default translations;
