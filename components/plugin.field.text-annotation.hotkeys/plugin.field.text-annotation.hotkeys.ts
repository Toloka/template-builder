import { Core, CreateOptions, Plugin } from '@toloka-tb/core/coreComponentApi';
import { actionCreators, TextAnnotationHotkeyHandlers } from '@toloka-tb/field.text-annotation';
import { setListeners } from '@toloka-tb/plugin.hotkeys';

type PluginFieldTextAnnotationHotkeysProps = {
    labels: string[];
    remove: string;
};

const defaults = {
    labels: ['1', '2', '3', '4', '5'],
    remove: 'x'
};

const type = 'plugin.field.text-annotation.hotkeys';

export const create = (core: Core, options: CreateOptions) => {
    return {
        type,
        compile: core.helpers.plugin(
            (givenProps: PluginFieldTextAnnotationHotkeysProps): Plugin => {
                const props = { ...defaults, ...givenProps };

                return {
                    init: (bag) => {
                        const handlers: TextAnnotationHotkeyHandlers = {
                            annotate: [],
                            remove: []
                        };

                        const labelHandlers = props.labels.reduce(
                            (acc, sequence, index) => ({
                                ...acc,
                                [sequence]: () => handlers.annotate.forEach((handler) => handler(index))
                            }),
                            {}
                        );

                        const destroy = setListeners(options, bag, {
                            ...labelHandlers,
                            [props.remove]: () => handlers.remove.forEach((handler) => handler())
                        });

                        const matcher = core.makeActionMatcher([
                            ...props.labels.map((sequence, index) => ({
                                matchingValue: sequence,
                                action: actionCreators.annotate({ payload: index }),
                                bag
                            })),
                            {
                                matchingValue: props.remove,
                                action: actionCreators.remove(),
                                bag
                            }
                        ]);

                        return {
                            type: 'action',
                            name: 'field.text-annotation.hotkeys',
                            settings: {
                                'field.text-annotation': handlers
                            },
                            match: matcher.match,
                            destroy
                        };
                    }
                };
            }
        )
    };
};
