export type Lock = { [type: string]: string };

export type JsonConfig = {
    view: object;
    plugins?: Array<{ type: string }>;
    vars?: unknown;
};

// later would get meta params like `syntax: 'markdown' | 'text' | 'url';`
type Key = { key: string };
export type Intl = {
    translations: { [lang: string]: { [key: string]: string } };
    keys: Key[];
};
