import { alwaysPassSchema, isGettable, TbJSONSchema } from '@toloka-tb/component2schema';
import { makeFieldSchema } from '@toloka-tb/schemas/field';

export const schema = makeFieldSchema('field.file', {
    schema: {
        type: 'object',
        properties: {
            multiple: {
                type: 'boolean',
                default: true
            },
            accept: {
                type: 'array',
                items: {
                    type: 'string',
                    default: '*/*'
                }
            }
        },
        default: {
            type: 'field.file',
            multiple: true,
            data: {
                type: 'data.output',
                path: 'path'
            },
            validation: {
                type: 'condition.required'
            }
        },
        required: []
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
