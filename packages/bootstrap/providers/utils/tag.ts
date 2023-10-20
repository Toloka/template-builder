const tagDivider = `_@_`;

export const toTag = (type: string, version: string) => `${type}${tagDivider}${version.split('.')[0]}`;
export const tagToType = (tag: string) => tag.split(tagDivider)[0];
