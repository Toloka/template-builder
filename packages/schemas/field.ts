import merge from 'deepmerge';
import { JSONSchema7 } from 'json-schema';

import { RTLProps } from './rtl';
import { makeViewSchema, SchemaGenProps } from './view';
type FieldCommonSchema = {
    properties: Partial<{
        label: {
            type: 'string';
            default: string;
            description: string;
        };
        hint: {
            type: 'string';
            default: string;
            description: string;
        };
        data: {
            $ref: '#/definitions/dataRW';
            description: string;
        };
        validation: {
            $ref: '#/definitions/components/condition';
            description: string;
        };
        preserveFalse: {
            type: 'boolean';
            default: true;
            description: string;
        };
        rtl: RTLProps;
    }>;
    required: Array<'data'>;
};

type FieldSchemaGenProps<T extends JSONSchema7> = SchemaGenProps<T> & { booleanField?: boolean };

export const makeFieldSchema = <T extends JSONSchema7>(type: string, props: FieldSchemaGenProps<T>) => {
    const result = makeViewSchema(type, {
        ...props,
        validation: true,
        schema: {}
    });

    if (props.booleanField) {
        result.properties.preserveFalse = {
            type: 'boolean',
            default: true
        };
    }

    result.properties.data = {
        $ref: '#/definitions/dataRW'
    };
    result.required.push('data');

    return merge(result, props.schema) as FieldCommonSchema & ReturnType<typeof makeViewSchema>;
};
