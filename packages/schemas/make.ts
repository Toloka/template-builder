import merge from 'deepmerge';
import { JSONSchema7 } from 'json-schema';

export const makeSchema = <T extends JSONSchema7>(
    type: string,
    description: string | undefined,
    shortDescription: string | undefined,
    schema: T
) =>
    merge(
        {
            type: 'object',
            title: type,
            description,
            shortDescription,
            properties: {
                type: {
                    type: 'string',
                    default: type,
                    const: type,
                    description,
                    shortDescription
                }
            },
            required: ['type'],
            default: { type }
        },
        schema
    );

const schemaFactory = <T extends JSONSchema7>(
    type: string,
    { schema, description, shortDescription }: { schema: T; description?: string; shortDescription?: string }
) => makeSchema(type, description, shortDescription, schema);

export const makeActionSchema = schemaFactory;
export const makePluginSchema = schemaFactory;
export const makeHelperSchema = schemaFactory;
export const makeDataSchema = schemaFactory;
