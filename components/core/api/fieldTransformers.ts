// any is used due to typecscript inference bugs

export const emptyStringTransformer = (x: any) => (typeof x !== 'string' || x.length > 0 ? x : undefined);

export const emptyArrayTransformer = (x: any) => (!Array.isArray(x) || x.length > 0 ? x : undefined);
