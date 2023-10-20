import { Core } from '@toloka-tb/core/coreComponentApi';

import translations from './i18n/condition.more.translations';

export type ConditionMoreProps = {
    data: number;
    then: number;
    orEquals?: true;
};

const type = 'condition.more';

export const create = (core: Core) => {
    const { hideUndefined } = core.conditionUtils;

    return {
        type,
        compile: core.helpers.conditionV2<ConditionMoreProps, keyof typeof translations.ru>(
            type,
            (props) => {
                if (isNaN(props.data) || isNaN(props.then)) return false;

                if (props.data > props.then) {
                    return true;
                } else if (props.orEquals && props.data >= props.then) {
                    return true;
                }

                return false;
            },
            (t, props) => ({
                direct: () =>
                    props.orEquals
                        ? {
                              message: t('shouldBeMoreOrEqual', {
                                  data: hideUndefined(props.data),
                                  then: hideUndefined(props.then)
                              })
                          }
                        : {
                              message: t('shouldBeMore', {
                                  data: hideUndefined(props.data),
                                  then: hideUndefined(props.then)
                              })
                          },
                opposite: () =>
                    props.orEquals
                        ? {
                              message: t('shouldBeLess', {
                                  data: hideUndefined(props.data),
                                  then: hideUndefined(props.then)
                              })
                          }
                        : {
                              message: t('shouldBeLessOrEqual', {
                                  data: hideUndefined(props.data),
                                  then: hideUndefined(props.then)
                              })
                          }
            })
        )
    };
};

export { translations };
