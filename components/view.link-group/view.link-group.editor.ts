import { HTTP_URL_PATTERN } from '@yandex-tb/common/constants/url';

import { makeViewSchema } from '@toloka-tb/schemas/view';

export const schema = makeViewSchema('view.link-group', {
    schema: {
        type: 'object',
        title: 'view.link-group',
        properties: {
            links: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        url: {
                            type: 'string',
                            pattern: HTTP_URL_PATTERN,
                            default: 'https://google.com'
                        },
                        content: {
                            type: 'string'
                        },

                        theme: {
                            type: 'string',
                            enum: ['primary']
                        }
                    },
                    required: ['url', 'content']
                }
            }
        },
        default: {
            type: 'view.link-group',
            links: [
                {
                    url: {
                        type: 'helper.search-query',
                        query: 'JSON',
                        engine: 'yandex'
                    },
                    theme: 'primary',
                    content: 'Yandex'
                },
                {
                    url: {
                        type: 'helper.search-query',
                        query: 'JSON',
                        engine: 'google'
                    },
                    content: 'Google'
                },
                {
                    url: {
                        type: 'helper.search-query',
                        query: 'JSON',
                        engine: 'wikipedia'
                    },
                    content: 'Wikipedia'
                }
            ]
        },
        required: ['links']
    }
});
