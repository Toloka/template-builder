import { parseJSON } from '@toloka-tb/lang.json';

import { setEditors } from '../../typeHandlers/typeHandlers';
import { setupWorkerI18n } from '../workerI18n';
import { validate } from './validate';

setupWorkerI18n({ fallbackLng: 'dev' }, {});

setEditors({
    'view.text': {
        schema: {
            type: 'object',
            title: 'view.text',
            description:
                'Блок для отображения текста.\n\nЕсли вам нужен отформатированный текст, используйте компонент [view.markdown](view.markdown.md).',
            properties: {
                type: {
                    type: 'string',
                    default: 'view.text',
                    const: 'view.text',
                    description:
                        'Блок для отображения текста.\n\nЕсли вам нужен отформатированный текст, используйте компонент [view.markdown](view.markdown.md).'
                },
                label: {
                    type: 'string',
                    default: 'Label',
                    description: 'Надпись рядом с компонентом.'
                },
                hint: {
                    type: 'string',
                    default: 'Hint',

                    description: 'Текст всплывающей подсказки. Для вставки переноса строки используйте `\\n`.'
                },
                validation: {
                    $ref: '#/definitions/components/condition',
                    description: 'Валидация на основе условия _(condition)_.'
                },
                content: {
                    type: 'string',
                    default: '',
                    description: 'Текст, отображаемый в блоке. Для вставки переноса строки используйте `\\n`.'
                }
            },
            required: ['type'],
            default: { type: 'view.text', content: 'text' }
        }
    }
});

describe('editor.lang validation', () => {
    it('does not create errors for correct config', () => {
        const config = JSON.stringify({
            view: {
                type: 'view.text',
                content: 'magic'
            }
        });

        const { value } = parseJSON(config);
        const markers = validate(value!);

        expect(markers.length).toBe(0);
    });

    it('does not create value errors for invalid keys', () => {
        const config = JSON.stringify({
            view: {
                type: 'view.text',
                content: 'magic',
                wrongKey: {
                    type: 'wrong.wrong'
                }
            }
        });

        const { value } = parseJSON(config);
        const markers = validate(value!);

        expect(markers.length).toBe(1);
        expect(markers[0]).toMatchObject({ from: 46, message: 'validation.unknownProperty', to: 56 });
    });

    it('can produce multiple errors', () => {
        const config = JSON.stringify({
            view: {
                type: 'view.text',
                content: 'magic',
                wrongKey: {
                    type: 'wrong.wrong'
                },
                wrongKey2: {
                    type: 'wrong.wrong'
                }
            }
        });

        const { value } = parseJSON(config);
        const markers = validate(value!);

        expect(markers.length).toBe(2);
    });

    it('does not validate component with wrong type', () => {
        const config = JSON.stringify({
            view: {
                type: 'view.wrong',
                content: 666,
                otherKey: 777
            }
        });

        const { value } = parseJSON(config);
        const markers = validate(value!);

        expect(markers.length).toBe(1);
        expect(markers[0]).toMatchObject({ from: 16, message: 'validation.unsuitableType', to: 28 });
    });
});
