import { ExpectationManager, Options } from '../../expectations/expectations';

enum CompletionItemKind {
    Method = 0,
    Function = 1,
    Constructor = 2,
    Field = 3,
    Variable = 4,
    Class = 5,
    Struct = 6,
    Interface = 7,
    Module = 8,
    Property = 9,
    Event = 10,
    Operator = 11,
    Unit = 12,
    Value = 13,
    Constant = 14,
    Enum = 15,
    EnumMember = 16,
    Keyword = 17,
    Text = 18,
    Color = 19,
    File = 20,
    Reference = 21,
    Customcolor = 22,
    Folder = 23,
    TypeParameter = 24,
    Snippet = 25
}

export type ProviderResult = {
    value: string;
    kind: CompletionItemKind;
    label: string;
    priority: number;
    snippet?: boolean;
    documentation?: string;
};

export type AutoCompleteProvider = (expectation: ExpectationManager, options: Options) => ProviderResult[];

export const makeResult = (
    value: any,
    priority: number,
    options: {
        kind?: CompletionItemKind;
        label?: string | undefined;
        documentation?: string | undefined;
        snippet?: boolean;
    } = {}
): ProviderResult => {
    return {
        value: options.snippet ? value : JSON.stringify(value, null, 2),
        priority,
        kind: options.kind || CompletionItemKind.Snippet,
        label: options.label ? options.label : JSON.stringify(value),
        ...options
    };
};

export const makeSnippet = (
    value: string,
    priority: number,
    options: {
        kind?: CompletionItemKind;
        label?: string | undefined;
        documentation?: string | undefined;
    } = {}
): ProviderResult => {
    const fixedValue = value.replace(/\${\d}/g, '');

    return {
        value,
        priority,
        snippet: true,
        kind: options.kind || CompletionItemKind.Snippet,
        label: options.label ? options.label : fixedValue,
        ...options
    };
};

export const makeKey = (
    value: string,
    priority: number,
    documentation: string | undefined = undefined
): ProviderResult => ({
    value: `"${value}"`,
    priority,
    label: `"${value}"`,
    kind: CompletionItemKind.Keyword,
    documentation
});
