import { JSONConfig } from '@toloka-tb/core/compileConfig/compileConfig';

import { BreifConfig, BreifEditorConfig } from '../briefStore';
import { getDataFromKey } from '../lib/getDataFromKey';

type ObjectRecognitionClass = { label: string; value: string };
type ObjectRecognitionParams = {
    image: string;
    shape: string;
    hasMultiple: boolean;
    classes: ObjectRecognitionClass[];
};

const createConfig = (params: ObjectRecognitionParams): JSONConfig => {
    const hotkeys: { [key: string]: object } = {};

    const config = {
        view: {
            type: 'field.image-annotation',
            image: {
                type: 'data.input',
                path: 'image'
            },
            fullHeight: true,
            data: {
                type: 'data.output',
                path: 'result'
            },
            validation: {
                type: 'condition.required',
                hint: 'Please select an area'
            },
            shapes: {
                [params.shape]: true
            }
        },
        plugins: [
            {
                type: 'plugin.toloka',
                layout: {
                    kind: 'pager'
                }
            },
            {
                type: 'plugin.field.image-annotation.hotkeys',
                ...hotkeys
            }
        ]
    } as any;

    if (params.classes && params.hasMultiple) {
        const classes = [...params.classes].filter(Boolean) as ObjectRecognitionClass[];

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

        config.view.labels = classes;
    }

    return config;
};

export const objectRecognitionBreifConfig: BreifConfig<ObjectRecognitionParams> = {
    name: 'objectRecognitionV1',
    getDefaultParams: getDataFromKey<ObjectRecognitionParams>('breif.objectRecognition.defaultParams'),
    getEditorConfig: getDataFromKey<BreifEditorConfig>('breif.objectRecognition.config'),
    parse: (params) => {
        if (params.classes && params.classes.some((c) => !c || !c.label || !c.value)) {
            return {
                isValid: false
            };
        }

        return {
            isValid: true,
            config: createConfig(params),
            input: { image: params.image }
        };
    }
};
