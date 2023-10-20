import { Emitter, IEvent, languages } from 'monaco-editor';

import { registerProviders } from './registerProviders';

// --- JSON configuration and defaults ---------
export class LanguageServiceDefaultsImpl implements languages.json.LanguageServiceDefaults {
    private _onDidChange = new Emitter<languages.json.LanguageServiceDefaults>();
    private _diagnosticsOptions!: languages.json.DiagnosticsOptions;
    private _languageId: string;

    modeConfiguration = {};
    setModeConfiguration = () => null;

    constructor(languageId: string, diagnosticsOptions: languages.json.DiagnosticsOptions) {
        this._languageId = languageId;
        this.setDiagnosticsOptions(diagnosticsOptions);
    }

    get onDidChange(): IEvent<languages.json.LanguageServiceDefaults> {
        return this._onDidChange.event;
    }

    get languageId(): string {
        return this._languageId;
    }

    get diagnosticsOptions(): languages.json.DiagnosticsOptions {
        return this._diagnosticsOptions;
    }

    setDiagnosticsOptions(options: languages.json.DiagnosticsOptions): void {
        this._diagnosticsOptions = options || Object.create(null);
        this._onDidChange.fire(this);
    }
}

const diagnosticDefault: languages.json.DiagnosticsOptions = {
    validate: true,
    allowComments: true,
    schemas: [],
    enableSchemaRequest: false
};

const tbDefaults = new LanguageServiceDefaultsImpl('tb', diagnosticDefault);

// Export API
const createAPI = (): typeof languages.json => ({
    jsonDefaults: tbDefaults
});

languages.json = createAPI();

// --- Registration to monaco editor ---
export const langName = 'tb';

export const registerLanguage = () => {
    languages.register({
        id: langName,
        extensions: [`.${langName}`, '.json'],
        aliases: [langName.toUpperCase(), langName]
    });

    languages.onLanguage(langName, () => {
        registerProviders(tbDefaults);
    });
};
