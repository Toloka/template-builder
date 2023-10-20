import './adjustMonacoSuggestWidget';

import { IDisposable, languages } from 'monaco-editor';

import { CompletionAdapter } from './autocomplete';
import { DocumentFormattingEditProvider } from './format';
import { HoverAdapter } from './hover';
import { LanguageServiceDefaultsImpl } from './register';
import { languageConfig } from './tokens/languageConfig';
import { createTokenizationSupport } from './tokens/tokenizer';
import { Validation } from './validation';

const disposeAll = (disposables: IDisposable[]) => {
    while (disposables.length) {
        disposables.pop()!.dispose();
    }
};

const asDisposable = (disposables: IDisposable[]): IDisposable => ({ dispose: () => disposeAll(disposables) });

export const registerProviders = (defaults: LanguageServiceDefaultsImpl): IDisposable => {
    const disposables: IDisposable[] = [];
    const providers: IDisposable[] = [];

    const registerProviders = (): void => {
        const { languageId } = defaults;

        disposeAll(providers);

        providers.push(
            languages.registerDocumentFormattingEditProvider(languageId, new DocumentFormattingEditProvider())
        );

        // modeConfiguration.documentSymbols
        // modeConfiguration.foldingRanges

        providers.push(languages.registerHoverProvider(languageId, new HoverAdapter()));
        providers.push(languages.setTokensProvider(languageId, createTokenizationSupport()));
        providers.push(languages.registerCompletionItemProvider(languageId, new CompletionAdapter()));
        providers.push(new Validation(languageId));
    };

    registerProviders();

    disposables.push(languages.setLanguageConfiguration(defaults.languageId, languageConfig));

    disposables.push(asDisposable(providers));

    return asDisposable(disposables);
};
