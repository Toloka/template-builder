import merge from 'deepmerge';
import { JSONSchema7 } from 'json-schema';

import { listLayoutSchema } from './list';
import { makeSchema } from './make';
import { mediaLayoutSchema } from './media';
import { rtlSchema } from './rtl';

type ViewCommonSchema = {
    type: 'object';
    title: string;
    description?: string;
    shortDescription?: string;
    properties: {
        type: {
            type: 'string';
            const: string;
            default: string;
            description?: string;
            shortDescription?: string;
        };
    } & Partial<{
        label: {
            type: 'string';
            default: string;
            docDefault: '';
            description?: string;
        };
        hint: {
            type: 'string';
            default: string;
            docDefault: '';
            description?: string;
        };
        requiredMark: {
            type: 'boolean';
            default: boolean;
            docDefault: '';
            description?: string;
            preventSuggest: boolean;
        };
        validation: {
            $ref: '#/definitions/components/condition';
            description?: string;
        };
        rtl: typeof rtlSchema;
    }>;
    default: {
        type: string;
    } & object;
    required: string[];
};

export type SchemaGenProps<T extends JSONSchema7> = {
    label?: boolean;
    hint?: boolean;
    requiredMark?: boolean;
    description?: string;
    shortDescription?: string;
    validation?: boolean;
    mediaLayoutProps?: boolean | Array<keyof typeof mediaLayoutSchema.properties>;
    listLayoutProps?: boolean;
    rtlProps?: boolean;
    schema: T;
};

export const makeViewSchema = <T extends JSONSchema7>(
    type: string,
    {
        label = true,
        hint = true,
        validation = true,
        requiredMark = false,
        description,
        shortDescription,
        mediaLayoutProps = false,
        listLayoutProps = false,
        rtlProps = false,
        schema
    }: SchemaGenProps<T>
) => {
    let result = makeSchema(type, description, shortDescription, {}) as ViewCommonSchema;

    if (label) {
        result.properties.label = {
            type: 'string',
            default: 'Label',
            docDefault: ''
        };
    }
    if (hint) {
        result.properties.hint = {
            type: 'string',
            default: 'Hint',
            docDefault: ''
        };
    }
    if (requiredMark) {
        result.properties.requiredMark = {
            type: 'boolean',
            default: false,
            docDefault: '',
            preventSuggest: true
        };
    }
    if (validation) {
        result.properties.validation = {
            $ref: '#/definitions/components/condition'
        };
    }

    if (mediaLayoutProps) {
        if (Array.isArray(mediaLayoutProps)) {
            mediaLayoutProps.forEach((prop) => {
                (result.properties as any)[prop] = mediaLayoutSchema.properties[prop];
            });
        } else {
            result = merge(result, mediaLayoutSchema);
        }
    }

    if (listLayoutProps) {
        result = merge(result, listLayoutSchema);
    }

    if (rtlProps) {
        result.properties.rtl = rtlSchema;
    }

    return merge(result, schema);
};
