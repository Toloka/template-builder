import { Core } from '@toloka-tb/core/coreComponentApi';
import hash from 'object-hash';

import translations from './i18n/condition.sub-array.translations';

export type ConditionSubArrayProps = {
    data: unknown[];
    parent: unknown[];
    equalSize?: boolean;
};

const type = 'condition.sub-array';

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.conditionV2<ConditionSubArrayProps, keyof typeof translations.ru>(
            type,
            (props) => {
                if (!Array.isArray(props.data) || !Array.isArray(props.parent)) return false;

                const parentHashMap: { [hash: string]: true } = {};

                props.parent.map((obj) => hash(obj)).forEach((hash) => (parentHashMap[hash] = true));

                return props.data.map((obj) => hash(obj)).every((hash) => hash in parentHashMap);
            },
            (t, props) => ({
                direct: () => ({
                    message: t('shouldContain', {
                        array: JSON.stringify(props.parent),
                        sub: JSON.stringify(props.data)
                    })
                }),
                opposite: () => ({
                    message: t('shouldNotContain', {
                        array: JSON.stringify(props.parent),
                        sub: JSON.stringify(props.data)
                    })
                })
            })
        )
    };
};

export { translations };
