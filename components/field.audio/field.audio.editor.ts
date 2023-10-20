import { alwaysPassSchema, isGettable, TbJSONSchema } from '@toloka-tb/component2schema';
import { makeFieldSchema } from '@toloka-tb/schemas/field';

export const schema = makeFieldSchema('field.audio', {
    schema: {
        properties: {
            multiple: {
                type: 'boolean'
            }
        },
        default: {
            type: 'field.audio',
            data: {
                type: 'data.output',
                path: 'path'
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
