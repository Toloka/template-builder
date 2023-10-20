import { JSONConfig } from '@toloka-tb/core/compileConfig/compileConfig';

import { BreifConfig, BreifEditorConfig } from '../briefStore';
import { getDataFromKey } from '../lib/getDataFromKey';

type TextClass = { label: string; value: string };
type TextClassificationParams = {
    question: string;
    headline: string;
    sample: string;
    classes: TextClass[];
    other?: TextClass;
};

const createConfig = (params: TextClassificationParams): JSONConfig => {
    const classes = [...params.classes, params.other].filter(Boolean) as TextClass[];

    const hotkeys: { [key: string]: object } = {};

    for (let idx = 0; idx < classes.length; ++idx) {
        hotkeys[`${idx + 1}`] = {
            type: 'action.set',
            data: {
                type: 'data.output',
                path: 'result'
            },
            payload: classes[idx].value
        };
    }

    return {
        view: {
            type: 'view.list',
            items: [
                {
                    type: 'view.text',
                    label: params.headline,
                    content: {
                        type: 'data.input',
                        path: 'headline'
                    }
                },
                {
                    type: 'field.button-radio-group',
                    validation: {
                        type: 'condition.required'
                    },
                    label: params.question,
                    options: classes,
                    data: {
                        type: 'data.output',
                        path: 'result'
                    }
                }
            ]
        },
        plugins: [
            {
                type: 'plugin.toloka',
                layout: {
                    kind: 'scroll',
                    taskWidth: 500
                }
            },
            {
                type: 'plugin.hotkeys',
                ...hotkeys
            }
        ]
    } as any;
};

export const textClassificationBreifConfig: BreifConfig<TextClassificationParams> = {
    name: 'textClassificationV1',
    getDefaultParams: getDataFromKey<TextClassificationParams>('breif.textClassification.defaultParams'),
    getEditorConfig: getDataFromKey<BreifEditorConfig>('breif.textClassification.config'),
    parse: (params) => {
        if (params.classes.some((c) => !c || !c.label || !c.value)) {
            return {
                isValid: false
            };
        }

        return {
            isValid: true,
            config: createConfig(params),
            input: { headline: params.sample }
        };
    }
};
