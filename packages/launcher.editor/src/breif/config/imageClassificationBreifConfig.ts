import { JSONConfig } from '@toloka-tb/core/compileConfig/compileConfig';

import { BreifConfig, BreifEditorConfig } from '../briefStore';
import { getDataFromKey } from '../lib/getDataFromKey';

type ImageClass = { label: string; value: string };
type ImageClassificationParams = {
    question: string;
    sample: string;
    classes: ImageClass[];
    other?: ImageClass;
    error: ImageClass;
};

const createConfig = (params: ImageClassificationParams): JSONConfig => {
    const classes = [...params.classes, params.other, params.error].filter(Boolean) as ImageClass[];

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
                    type: 'view.image',
                    ratio: [1, 1],
                    rotatable: true,
                    url: {
                        type: 'data.input',
                        path: 'image'
                    }
                },
                {
                    type: 'field.button-radio-group',
                    label: params.question,
                    options: classes,
                    data: {
                        type: 'data.output',
                        path: 'result'
                    },
                    validation: {
                        type: 'condition.required'
                    }
                }
            ]
        },
        plugins: [
            {
                type: 'plugin.toloka',
                layout: {
                    kind: 'scroll',
                    taskWidth: 600
                }
            },
            {
                type: 'plugin.hotkeys',
                ...hotkeys
            }
        ]
    } as any;
};

export const imageClassificationBreifConfig: BreifConfig<ImageClassificationParams> = {
    name: 'imageClassificationV1',
    getDefaultParams: getDataFromKey<ImageClassificationParams>('breif.imageClassification.defaultParams'),
    getEditorConfig: getDataFromKey<BreifEditorConfig>('breif.imageClassification.config'),
    parse: (params) => {
        if (params.classes.some((c) => !c || !c.label || !c.value)) {
            return {
                isValid: false
            };
        }

        return {
            isValid: true,
            config: createConfig(params),
            input: { image: params.sample }
        };
    }
};
