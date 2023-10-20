import { editorI18n } from '../../../../i18n/editorI18n';
import { normalizeDescriptionUrls } from './normalizeDescriptionUrls';
editorI18n.language = 'elvish';

describe('normalizeDescriptionUrls', () => {
    it('updates components urls', () => {
        (window as any).DOC_BASE_URL = 'https://toloka.ai/docs/template-builder';

        const originalStr = 'Some text before [my-component](my-component.md) some text after';
        const targetStr =
            'Some text before [my-component](https://toloka.ai/docs/template-builder/reference/my-component.html?lang=elvish) some text after';

        expect(normalizeDescriptionUrls(originalStr)).toBe(targetStr);
    });
    it('updates dita urls', () => {
        (window as any).DOC_BASE_URL = 'https://toloka.ai/docs/template-builder';

        const originalStr = 'Some text before [my-tutorial](my-tutorial.dita) some text after';
        const targetStr =
            'Some text before [my-tutorial](https://toloka.ai/docs/template-builder/reference/my-tutorial.html?lang=elvish) some text after';

        expect(normalizeDescriptionUrls(originalStr)).toBe(targetStr);
    });
    it("doesn't update absolute urls", () => {
        (window as any).DOC_BASE_URL = 'https://toloka.ai/docs/template-builder';

        const originalStr = 'Some text before [my-component](https://google.com) some text after';

        expect(normalizeDescriptionUrls(originalStr)).toBe(originalStr);
    });
});
