import { makeFieldSchema } from '@toloka-tb/schemas/field';

export const schema = makeFieldSchema('field.bounding-box', {
    schema: {
        type: 'object',
        title: 'field.bounding-box',
        properties: {
            image: {
                type: 'string'
            },
            disabled: {
                type: 'boolean',
                default: true
            }
        },
        default: {
            type: 'field.bounding-box',
            image: 'https://img2.goodfon.ru/original/2560x1600/2/b1/cat-eyes-kitty-blue-eyes-paws.jpg',
            data: {
                type: 'data.output',
                path: 'result'
            }
        },
        required: ['image']
    }
});

export const getDataSchema = () => ({
    type: 'array',
    items: {
        type: 'object',
        properties: {
            type: {
                type: 'string',
                const: 'rectangle'
            },
            top: {
                type: 'number'
            },
            left: {
                type: 'number'
            },
            height: {
                type: 'number'
            },
            width: {
                type: 'number'
            }
        },
        required: ['type', 'top', 'left', 'height', 'width']
    }
});
