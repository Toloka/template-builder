import { makeHelperSchema } from '@toloka-tb/schemas/make';

export const schema = makeHelperSchema('helper.search-query', {
    schema: {
        properties: {
            query: {
                type: 'string',
                default: 'SomeQuery'
            },
            engine: {
                anyOf: [
                    {
                        type: 'string' as const,
                        default: 'google',
                        // @ts-ignore
                        docDefault: '',
                        enum: [
                            'yandex',
                            'google',
                            'bing',
                            'mail.ru',
                            'wikipedia',
                            'yandex/collections',
                            'yandex/video',
                            'yandex/images',
                            'google/images',
                            'yandex/news',
                            'google/news'
                        ]
                    },
                    {
                        type: 'object' as const,
                        properties: {
                            name: {
                                type: 'string' as const,
                                enum: ['yandex']
                            },
                            regionId: {
                                type: 'string' as const,
                                default: '42'
                            },
                            family: {
                                type: 'string' as const,
                                default: 'moderate',
                                enum: ['none', 'yes', 'moderate']
                            }
                        },
                        required: ['name'],
                        default: {
                            name: 'yandex',
                            regionId: '42'
                        }
                    },
                    {
                        type: 'object' as const,
                        properties: {
                            name: {
                                type: 'string' as const,
                                enum: ['yandex/images']
                            },
                            family: {
                                type: 'string' as const,
                                default: 'moderate',
                                enum: ['none', 'yes', 'moderate']
                            }
                        },
                        required: ['name'],
                        default: {
                            name: 'yandex/images'
                        }
                    },
                    {
                        type: 'object' as const,
                        properties: {
                            name: {
                                type: 'string' as const,
                                enum: ['yandex/video']
                            },
                            family: {
                                type: 'string' as const,
                                default: 'moderate',
                                enum: ['none', 'yes', 'moderate']
                            }
                        },
                        required: ['name'],
                        default: {
                            name: 'yandex/video'
                        }
                    }
                ]
            }
        },
        required: ['type', 'query'],
        default: {
            type: 'helper.search-query',
            engine: 'google'
        }
    }
});
