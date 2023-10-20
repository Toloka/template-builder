import { makeHelperSchema } from '@toloka-tb/schemas/make';

export const schema = makeHelperSchema('helper.replace', {
    schema: {
        properties: {
            data: {
                $ref: '#/definitions/data',
                default: {
                    type: 'data.input',
                    path: 'path'
                }
            },
            find: {
                type: 'string',
                default: 'str1'
            },
            replace: {
                type: 'string',
                default: 'str2'
            }
            // params: {
            //     type: 'object',
            //     description: 'Дополнительные параметры для управления `helper.replace`.',
            //     properties: {
            //         replaceAll: {
            //             type: 'boolean',
            //             description: 'Найти и заменить __все__ соответствия `find` в строке.',
            //             default: true
            //         },
            //         regExp: {
            //             type: 'boolean',
            //             description: 'Использовать регулярное выражение вместо обычной строки.',
            //             default: true
            //         },
            //         caseInsensitive: {
            //             type: 'boolean',
            //             description: 'Регистр символов не имеет значения при поиске.',
            //             default: true
            //         }
            //     }
            // }
        },
        required: ['type', 'data', 'find', 'replace'],
        default: {
            type: 'helper.replace',
            data: {
                type: 'data.input',
                path: 'path'
            },
            find: 'str1',
            replace: 'str2'
            // params: {
            //     replaceAll: true,
            //     regExp: true,
            //     caseInsensitive: true
            // }
        }
    }
});
