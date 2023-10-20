import { Compiler, Core } from '@toloka-tb/core/coreComponentApi';
import makeAjv from 'ajv';
import { JSONSchema7 } from 'json-schema';

import translations from './i18n/condition.schema.translations';

export type ConditionSchemaProps = {
    data: unknown;
    schema: JSONSchema7 | true;
};

export const ajv = makeAjv();

const type = 'condition.schema';

export const create = (core: Core): Compiler<ConditionSchemaProps, any> => {
    return {
        type,
        compile: core.helpers.conditionV2<ConditionSchemaProps, keyof typeof translations.ru>(
            type,
            (props) => Boolean(ajv.validate(props.schema, props.data)),
            (t, props) => ({
                direct: () => ({
                    message: t('shouldPass', { schema: JSON.stringify(props.schema) })
                }),
                opposite: () => ({
                    message: t('shouldNotPass', { schema: JSON.stringify(props.schema) })
                })
            })
        ),
        options: {
            shallowKeys: ['schema']
        }
    };
};

export { translations };
