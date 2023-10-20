import { editor, languages } from 'monaco-editor';

export class DocumentFormattingEditProvider implements languages.DocumentFormattingEditProvider {
    public async provideDocumentFormattingEdits(model: editor.IReadOnlyModel) {
        const result: languages.TextEdit[] = [
            {
                range: model.getFullModelRange(),
                text: JSON.stringify(JSON.parse(model.getValue()), null, 2)
            }
        ];

        return result;
    }
}
