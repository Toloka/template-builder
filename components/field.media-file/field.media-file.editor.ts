import { alwaysPassSchema, isGettable, TbJSONSchema } from '@toloka-tb/component2schema';
import { makeFieldSchema } from '@toloka-tb/schemas/field';

export const schema = makeFieldSchema('field.media-file', {
    schema: {
        type: 'object',
        title: 'field.media-file',
        properties: {
            multiple: {
                type: 'boolean',
                default: true
            },
            accept: {
                type: 'object',
                properties: {
                    photo: {
                        type: 'boolean',
                        const: true
                    },
                    video: {
                        type: 'boolean',
                        const: true
                    },
                    gallery: {
                        type: 'boolean',
                        const: true
                    },
                    fileSystem: {
                        type: 'boolean',
                        const: true
                    }
                },
                default: {
                    photo: true,
                    video: true
                },
                minProperties: 1
            },
            requiredCoordinates: {
                type: 'boolean',
                description: ''
            }
        },
        default: {
            type: 'field.media-file',
            accept: {
                photo: true,
                video: true
            },
            multiple: true,
            data: {
                type: 'data.output',
                path: 'result'
            },
            validation: {
                type: 'condition.required'
            }
        },
        required: ['accept']
    }
});

export const getDataSchema = (props: any) => {
    if (isGettable(props.multiple)) {
        return alwaysPassSchema;
    }
    if (props.multiple === true) {
        return { type: 'array', items: { type: 'string', tbSpecialType: 'file' } } as TbJSONSchema;
    }

    return { type: 'string', tbSpecialType: 'file' } as TbJSONSchema;
};
