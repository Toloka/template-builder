import { reaction } from 'mobx';
import { editor, IDisposable, MarkerSeverity } from 'monaco-editor';

import { configStore } from '../../../../store/configStore';

export class Validation {
    private _disposables: IDisposable[] = [];
    private _dispose: { [uri: string]: () => void } = Object.create(null);

    constructor(private _languageId: string) {
        const onModelAdd = (model: editor.IModel): void => {
            const modeId = model.getModeId();

            if (modeId !== this._languageId) {
                return;
            }

            this._dispose[model.uri.toString()] = reaction(
                () => configStore.nextValidationErrors,
                () => {
                    if (model.isDisposed()) return;

                    const markers = configStore.nextValidationErrors.map((marker) => {
                        const from = model.getPositionAt(marker.from);
                        const to = model.getPositionAt(marker.to);

                        return {
                            startLineNumber: from.lineNumber,
                            startColumn: from.column,
                            endLineNumber: to.lineNumber,
                            endColumn: to.column,

                            message: marker.message,
                            severity: MarkerSeverity.Error,

                            resource: model.uri,
                            owner: 'validation'
                        };
                    });

                    editor.setModelMarkers(model, this._languageId, markers);
                }
            );
        };

        const onModelRemoved = (model: editor.IModel): void => {
            editor.setModelMarkers(model, this._languageId, []);
            const uriStr = model.uri.toString();
            const dispose = this._dispose[uriStr];

            if (dispose) {
                dispose();
                delete this._dispose[uriStr];
            }
        };

        this._disposables.push(editor.onDidCreateModel(onModelAdd));

        this._disposables.push({
            dispose: () => {
                editor.getModels().forEach(onModelRemoved);
                for (const key in this._dispose) {
                    this._dispose[key]();
                }
            }
        });

        editor.getModels().forEach(onModelAdd);
    }

    public dispose(): void {
        this._disposables.forEach((d) => d && d.dispose());
        this._disposables = [];
    }
}
