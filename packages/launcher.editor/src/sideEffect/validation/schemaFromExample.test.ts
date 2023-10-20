import { getSchemaFromExample } from './schemaFromExample';

describe('get validation', () => {
    it('parses primitive input data', () => {
        expect(getSchemaFromExample('str')).toMatchObject({ type: 'string' });
        expect(getSchemaFromExample(true)).toMatchObject({ type: 'boolean' });
        expect(getSchemaFromExample(14)).toMatchObject({ type: 'number' });
    });

    it('parses homogenous arrays', () => {
        expect(getSchemaFromExample([1, 2, 3, 4])).toMatchObject({ type: 'array', items: { type: 'number' } });
        expect(
            getSchemaFromExample([
                'https://toloka.ai/url',
                'https://toloka.ai/url',
                'https://toloka.ai/url',
                'https://toloka.ai/url'
            ])
        ).toMatchObject({ type: 'array', items: { type: 'string', tbSpecialType: 'url' } });

        expect(getSchemaFromExample([1, 'magic', 3, 34])).toBe(undefined);
    });

    it('parses urls', () => {
        expect(
            getSchemaFromExample('https://toloka.ai/url')
        ).toMatchObject({ type: 'string', tbSpecialType: 'url' });
    });

    it('suggest integer possibility', () => {
        expect(getSchemaFromExample(14)).toMatchObject({ type: 'number', tbSpecialType: 'maybeInteger' });
    });

    it('suggest coordinates possibility', () => {
        expect(getSchemaFromExample('123,123')).toMatchObject({ type: 'string', tbSpecialType: 'maybeCoordinates' });
    });
});
