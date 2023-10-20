type Key = string | number | symbol;

export const omit = <T = any>(obj: T, toOmit: Key[] | Key): T => {
    const result: any = {};
    const keys = Array.isArray(toOmit) ? toOmit : [toOmit];

    for (const prop in obj) {
        if (!keys.includes(prop)) {
            result[prop] = obj[prop];
        }
    }

    return result;
};

export const pick = <T = any>(obj: T, toPick: Key[] | Key): T => {
    const result: any = {};
    const keys = Array.isArray(toPick) ? toPick : [toPick];

    for (const prop of keys) {
        if (prop in obj) {
            result[prop] = (obj as any)[prop];
        }
    }

    return result;
};
