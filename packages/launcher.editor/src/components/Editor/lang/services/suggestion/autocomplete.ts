import { ComponentPath } from '../../ast/astUtils';
import { deriveExpectations } from '../../expectations/expectations';
import { dataPathProvider } from './providers/dataPathProvider';
import { $emptyProvider } from './providers/emptyProvider';
import { noConfigProvider } from './providers/noConfigProvider';
import { $refProvider } from './providers/refProvider';
import { schemaProvider } from './providers/schemaProvider';
import { tbValuesProvider } from './providers/tbValuesProvider';
import { typeDefaultProvider } from './providers/typeDefaultProvider';
import { typeProvider } from './providers/typeProvider';
import { ProviderResult } from './suggestionTypes';

const providers = [
    dataPathProvider,
    schemaProvider,
    typeDefaultProvider,
    typeProvider,
    tbValuesProvider,
    $emptyProvider,
    $refProvider,
    noConfigProvider
];

export const suggest = (componentPath: ComponentPath) => {
    const suggestions: ProviderResult[] = [];

    const expectations = deriveExpectations(componentPath, { expectFilledCollections: true });

    providers.forEach((provider) => {
        const providerSuggestions = provider(expectations.manager, expectations.options);

        suggestions.push(...providerSuggestions);
    });

    return suggestions;
};
