import { TbJSONSchema } from '@toloka-tb/component2schema';
import isEqual from 'react-fast-compare';

export const getSchemaFromExample = (example: unknown): TbJSONSchema | undefined => {
    if (['boolean', 'number', 'string'].includes(typeof example)) {
        const schema: TbJSONSchema = { type: typeof example as 'boolean' | 'number' | 'string' };

        if (typeof example === 'string' && (example.startsWith('http://') || example.startsWith('https://'))) {
            schema.tbSpecialType = 'url';
        }
        if (typeof example === 'number' && Number.isInteger(example)) {
            schema.tbSpecialType = 'maybeInteger';
        }
        if (typeof example === 'string') {
            const looksLikeCoordinates =
                example.split(',').length === 2 && example.split(',').every((coord) => !isNaN(parseFloat(coord)));

            if (looksLikeCoordinates) {
                schema.tbSpecialType = 'maybeCoordinates';
            }
        }

        return schema;
    }

    if (Array.isArray(example) && example.length > 0) {
        const schemas = example.map(getSchemaFromExample);
        const itemSchemaReference = schemas[0];

        if (
            schemas.every((itemSchema) => {
                return isEqual(itemSchema, itemSchemaReference);
            })
        ) {
            return {
                type: 'array',
                items: itemSchemaReference
            };
        }
    }
};
