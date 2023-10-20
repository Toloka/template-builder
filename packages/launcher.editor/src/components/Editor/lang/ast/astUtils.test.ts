import { parseJSON } from '@toloka-tb/lang.json';

import { getComponentPath } from './astUtils';

const template = `
{
    "view": {
        "type": "view.list",
        "items": [
            {
                "type": "view.list",
                "direction": "vertical",
                "items": [
                    {
                        "type": "view.text",
                        "content": "Sites copies"
                    },
                    {
                        "type": 123,
                        "url": "https://google.com"
                    },
                    {
                        "type": ,
                        "magic": "https://google.com"
                    },
                    {
                        "type": "field.radio-group",
                        "options": [{
                            "label": "op1",
                            "value": "o1"
                        }, {
                            "label":,
                            "value": "o2"
                        }]
                    }
                ]
            }
        ]
    }
}
`;

describe('editor', () => {
    describe('getComponentPath', () => {
        const { value } = parseJSON(template);

        if (!value) {
            return expect(value).not.toBe(undefined);
        }

        it('returns type "root" for root', () => {
            expect(getComponentPath(value, 0).type).toBe('root');
            expect(getComponentPath(value, template.indexOf('"view"') + 2).type).toBe('root');
        });

        it('returns component`s type for components', () => {
            expect(getComponentPath(value, template.indexOf(`"view.list"`) + 1).type).toBe('view.list');
        });

        it('last type for nested components', () => {
            const textIdx = template.indexOf(`"view.text"`) + 4;

            expect(getComponentPath(value, textIdx).type).toBe('view.text');
            expect(getComponentPath(value, template.indexOf(`:`, textIdx) + 4).type).toBe('view.text');
        });

        it('returns type=invalid if type isn`t string', () => {
            expect(getComponentPath(value, template.indexOf(`123`) + 3).type).toBe('invalid');
        });

        it('returns type=invalid if there is no value for type', () => {
            expect(getComponentPath(value, template.indexOf(`magic`)).type).toBe('invalid');
        });

        it('returns in-component path fully', () => {
            const path = getComponentPath(value, template.indexOf(`o2`));

            expect(path.type).toBe('field.radio-group');
            expect(path.path).toEqual(['options', 1, 'value']);
        });

        it('returns kind=key for keys', () => {
            const path = getComponentPath(value, template.indexOf(`value": "o1"`));

            expect(path.kind).toBe('key');
        });

        it('returns kind=value for values', () => {
            const path = getComponentPath(value, template.indexOf(`o1`));

            expect(path.kind).toBe('value');
        });

        it('returns  kind=value after :', () => {
            const path = getComponentPath(value, template.indexOf(`: "op1",`) + 1);

            expect(path.path).toEqual(['options', 0, 'label']);
            expect(path.kind).toBe('value');
        });

        it('returns  kind=value after :', () => {
            const path = getComponentPath(value, template.indexOf(`:,`) + 1);

            expect(path.path).toEqual(['options', 1, 'label']);
            expect(path.kind).toBe('value');
        });

        it('returns kind=value if value is missing', () => {
            const noType = `"type": ,`;
            const idx = template.indexOf(noType);
            const path = getComponentPath(value, template.indexOf(':', idx) + 1);

            expect(path.kind).toBe('value');
        });
    });
});
