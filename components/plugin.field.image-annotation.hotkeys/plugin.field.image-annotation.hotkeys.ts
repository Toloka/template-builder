import { Core, CreateOptions, Plugin } from '@toloka-tb/core/coreComponentApi';
import { actionCreators, ImageAnnotationHotkeyHandlers } from '@toloka-tb/field.image-annotation';
import { setListeners } from '@toloka-tb/plugin.hotkeys';

type PluginFieldImageAnnotationHotkeysProps = {
    labels: string[];
    modes: {
        select: string;
        point: string;
        rectangle: string;
        polygon: string;
    };
    confirm: string;
    cancel: string;
};

const defaults = {
    labels: ['1', '2', '3', '4', '5'],
    modes: {
        select: 'q',
        point: 'w',
        rectangle: 'e',
        polygon: 'r'
    },
    cancel: 'z',
    confirm: 'x'
};

const type = 'plugin.field.image-annotation.hotkeys';

const noop = () => {
    /* */
};

export const create = (core: Core, options: CreateOptions) => {
    return {
        type,
        compile: core.helpers.plugin(
            (givenProps: PluginFieldImageAnnotationHotkeysProps): Plugin => {
                const props = { ...defaults, ...givenProps };

                return {
                    init: (bag) => {
                        const handlers: ImageAnnotationHotkeyHandlers = {
                            setLabel: noop,
                            toggleMode: noop,
                            cancel: noop,
                            confirm: noop
                        };

                        const labelHandlers = props.labels.reduce(
                            (acc, sequence, index) =>
                                Object.assign(acc, { [sequence]: () => handlers.setLabel(index) }),
                            {}
                        );

                        const nodeHandlers = Object.entries(props.modes).reduce(
                            (acc, [mode, sequence]) =>
                                Object.assign(acc, {
                                    [sequence]: () =>
                                        handlers.toggleMode(
                                            mode as keyof PluginFieldImageAnnotationHotkeysProps['modes']
                                        )
                                }),
                            {}
                        );

                        const destroy = setListeners(options, bag, {
                            ...labelHandlers,
                            ...nodeHandlers,
                            [props.cancel]: () => handlers.cancel(),
                            [props.confirm]: () => handlers.confirm()
                        });

                        const matcher = core.makeActionMatcher([
                            ...props.labels.map((sequence, index) => ({
                                matchingValue: sequence,
                                action: actionCreators.setActiveLabel({ payload: index }),
                                bag
                            })),
                            ...Object.entries(props.modes).map(([mode, sequence]) => ({
                                matchingValue: sequence,
                                action: actionCreators.toggleMode({ payload: mode }),
                                bag
                            })),
                            {
                                matchingValue: props.cancel,
                                action: actionCreators.cancel(),
                                bag
                            },
                            {
                                matchingValue: props.confirm,
                                action: actionCreators.confirm(),
                                bag
                            }
                        ]);

                        return {
                            type: 'action',
                            name: 'field.image-annotation.hotkeys',
                            settings: {
                                'field.image-annotation': handlers
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
