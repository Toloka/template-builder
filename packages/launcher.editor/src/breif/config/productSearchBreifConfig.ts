import { JSONConfig } from '@toloka-tb/core/compileConfig/compileConfig';

import { BreifConfig, BreifEditorConfig } from '../briefStore';
import { getDataFromKey } from '../lib/getDataFromKey';

type ProductSearchClass = { label: string; value: string };
type ProductSearchClassificationParams = {
    query: string;
    image: string;
    sample: string;
    search_url: string;
    classes: ProductSearchClass[];
    error: ProductSearchClass;
};

const createConfig = (params: ProductSearchClassificationParams): JSONConfig => {
    const classes = [...params.classes, params.error].filter(Boolean) as ProductSearchClass[];

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

    let searchHost;

    try {
        searchHost = new URL(params.search_url).hostname
            .split('.')
            .slice(1, -1)
            .join('.');
    } catch (e) {
        searchHost = '';
    }

    const searchTitle = `Search query in ${searchHost[0].toUpperCase()}${searchHost.slice(1)}`;

    return {
        view: {
            type: 'view.list',
            items: [
                {
                    type: 'layout.sidebar',
                    minWidth: 400,
                    content: {
                        type: 'view.list',
                        size: 'm',
                        direction: 'vertical',
                        items: [
                            {
                                type: 'view.image',
                                maxWidth: 350,
                                url: {
                                    type: 'data.input',
                                    path: 'imagepath'
                                }
                            },
                            {
                                type: 'view.markdown',
                                label: 'Product title',
                                content: {
                                    type: 'data.input',
                                    path: 'title'
                                }
                            }
                        ]
                    },
                    controls: {
                        type: 'view.list',
                        direction: 'vertical',
                        items: [
                            {
                                type: 'view.alert',
                                theme: 'info',
                                label: 'Search query',
                                content: {
                                    type: 'view.text',
                                    content: {
                                        type: 'data.input',
                                        path: 'query'
                                    }
                                }
                            },
                            {
                                type: 'view.action-button',
                                label: searchTitle,
                                action: {
                                    type: 'action.open-link',
                                    payload: {
                                        type: 'data.input',
                                        path: 'search_url'
                                    }
                                }
                            },
                            {
                                type: 'view.divider'
                            },
                            {
                                type: 'field.radio-group',
                                label: 'Choose relevance class',
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

export const productSearchBreifConfig: BreifConfig<ProductSearchClassificationParams> = {
    name: 'productSearchV1',
    getDefaultParams: getDataFromKey<ProductSearchClassificationParams>('breif.productSearch.defaultParams'),
    getEditorConfig: getDataFromKey<BreifEditorConfig>('breif.productSearch.config'),
    parse: (params) => {
        if (params.classes.some((c) => !c || !c.label || !c.value)) {
            return {
                isValid: false
            };
        }

        return {
            isValid: true,
            config: createConfig(params),
            input: {
                imagepath: params.image,
                title: params.sample || '',
                query: params.query || '',
                search_url: params.search_url
            }
        };
    }
};
