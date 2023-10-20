import { parseJSON } from '@toloka-tb/lang.json';

import { getComponentPath } from '../../../ast/astUtils';
import { schemaMatcher } from './schemaMatcher';

const config = JSON.stringify({
    view: {
        type: 'view.text',
        content: 'text'
    },
    plugins: [
        {
            type: 'plugin.toloka',
            layout: {
                kind: 'scroll',
                taskWidth: 300
            }
        }
    ]
});

const configBad = JSON.stringify({
    view: {
        type: 'view.text',
        content: 'text'
    },
    plugins: [
        {
            type: 'plugin.toloka',
            layout: {
                kind: 'stroll',
                taskWidth: 300
            }
        }
    ]
});

const astGood = parseJSON(config).value!;
const astBad = parseJSON(configBad).value!;
const cp = getComponentPath(astGood, config.indexOf('scroll'));
const expectations = { expectedType: 'value', isExpected: (traits: any[]) => traits.includes('string') } as any;

describe('schema matcher', () => {
    it('respects enums', () => {
        const match = schemaMatcher(expectations, {
            schemas: [
                {
                    type: 'string',
                    enum: ['scroll', 'pager', 'first-task-only'],

                    description:
                        'Способ отображения заданий:<ul><li>`scroll` (по умолчанию) — отображать несколько заданий на странице одновременно.</li><li>`pager` — отображать на странице только одно задание, но внизу под заданием будет переключатель между заданиями.</li></ul>'
                }
            ],
            componentPath: cp
        });

        const fail = schemaMatcher(expectations, {
            schemas: [
                {
                    type: 'string',
                    enum: ['scroll', 'pager', 'first-task-only'],

                    description:
                        'Способ отображения заданий:<ul><li>`scroll` (по умолчанию) — отображать несколько заданий на странице одновременно.</li><li>`pager` — отображать на странице только одно задание, но внизу под заданием будет переключатель между заданиями.</li></ul>'
                }
            ],
            componentPath: getComponentPath(astBad, configBad.indexOf('stroll'))
        });

        expect(match && match.valid).toBe(true);
        expect(fail && fail.valid).toBe(false);
    });

    it('respects enums', () => {
        const match = schemaMatcher(expectations, {
            schemas: [
                {
                    type: 'string',
                    enum: ['scroll', 'pager', 'first-task-only'],

                    description:
                        'Способ отображения заданий:<ul><li>`scroll` (по умолчанию) — отображать несколько заданий на странице одновременно.</li><li>`pager` — отображать на странице только одно задание, но внизу под заданием будет переключатель между заданиями.</li></ul>'
                }
            ],
            componentPath: cp
        });

        const fail = schemaMatcher(expectations, {
            schemas: [
                {
                    type: 'string',
                    enum: ['scroll', 'pager', 'first-task-only'],

                    description:
                        'Способ отображения заданий:<ul><li>`scroll` (по умолчанию) — отображать несколько заданий на странице одновременно.</li><li>`pager` — отображать на странице только одно задание, но внизу под заданием будет переключатель между заданиями.</li></ul>'
                }
            ],
            componentPath: getComponentPath(astBad, configBad.indexOf('stroll'))
        });

        expect(match && match.valid).toBe(true);
        expect(fail && fail.valid).toBe(false);
    });
});
