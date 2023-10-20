import { makeViewSchema } from '@toloka-tb/schemas/view';

export const schema = makeViewSchema('view.table', {
    schema: {
        type: 'object',
        title: 'view.table',
        properties: {
            headers: {
                type: 'array',
                items: {
                    $ref: '#/definitions/view'
                },

                default: [
                    {
                        type: 'view.text',
                        content: 'A'
                    },
                    {
                        type: 'view.text',
                        content: 'B'
                    },
                    {
                        type: 'view.text',
                        content: 'C'
                    }
                ]
            },
            items: {
                type: 'array',
                items: {
                    type: 'array',
                    items: {
                        $ref: '#/definitions/view'
                    }
                },

                default: [
                    [
                        {
                            type: 'view.text',
                            content: 'a'
                        },
                        {
                            type: 'view.text',
                            content: 'b'
                        },
                        {
                            type: 'view.text',
                            content: 'c'
                        }
                    ],
                    [
                        {
                            type: 'view.text',
                            content: 'a'
                        },
                        {
                            type: 'view.text',
                            content: 'b'
                        },
                        {
                            type: 'view.text',
                            content: 'c'
                        }
                    ]
                ]
            }
        },
        default: {
            type: 'view.table',
            headers: [
                {
                    type: 'view.text',
                    content: 'A'
                },
                {
                    type: 'view.text',
                    content: 'B'
                },
                {
                    type: 'view.text',
                    content: 'C'
                }
            ],
            items: [
                [
                    {
                        type: 'view.text',
                        content: 'a'
                    },
                    {
                        type: 'view.text',
                        content: 'b'
                    },
                    {
                        type: 'view.text',
                        content: 'c'
                    }
                ],
                [
                    {
                        type: 'view.text',
                        content: 'a'
                    },
                    {
                        type: 'view.text',
                        content: 'b'
                    },
                    {
                        type: 'view.text',
                        content: 'c'
                    }
                ]
            ]
        }
    }
});
