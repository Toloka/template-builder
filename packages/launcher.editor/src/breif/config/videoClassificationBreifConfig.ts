import { JSONConfig } from '@toloka-tb/core/compileConfig/compileConfig';

import { BreifConfig, BreifEditorConfig } from '../briefStore';
import { getDataFromKey } from '../lib/getDataFromKey';

type VideoClass = { label: string; value: string };
type VideoClassificationParams = {
    question: string;
    sample: string;
    classes: VideoClass[];
    other?: VideoClass;
    error: VideoClass;
};

const createConfig = (params: VideoClassificationParams): JSONConfig => {
    const classes = [...params.classes, params.other, params.error].filter(Boolean) as VideoClass[];

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
                    type: 'view.video',
                    ratio: [1, 1],
                    url: {
                        type: 'data.input',
                        path: 'video'
                    },
                    validation: {
                        type: 'condition.played'
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

export const videoClassificationBreifConfig: BreifConfig<VideoClassificationParams> = {
    name: 'videoClassificationV1',
    getDefaultParams: getDataFromKey<VideoClassificationParams>('breif.videoClassification.defaultParams'),
    getEditorConfig: getDataFromKey<BreifEditorConfig>('breif.videoClassification.config'),
    parse: (params) => {
        if (params.classes.some((c) => !c || !c.label || !c.value)) {
            return {
                isValid: false
            };
        }

        return {
            isValid: true,
            config: createConfig(params),
            input: { video: params.sample }
        };
    }
};
