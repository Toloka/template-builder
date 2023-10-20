// we do this manually coz mobx requires direct property access for it's reactivity system to work
export const getByPath = <T = any>(obj: any, parts: string[] | string | undefined, defaultValue?: T): T => {
    if (parts === undefined || typeof obj !== 'object') {
        return typeof obj !== 'undefined' ? obj : defaultValue;
    }
    const parsedParts = Array.isArray(parts) ? parts : parts.split('.');

    let target = obj;

    const partsLength = parsedParts.length;

    for (let i = 0; i < partsLength; ++i) {
        const part = parsedParts[i];

        if (typeof obj !== 'object') {
            return typeof obj !== 'undefined' ? obj : defaultValue;
        }

        if (!target) {
            return defaultValue as any;
        }

        if (Array.isArray(target) && target.length <= parseInt(part, 10)) {
            return defaultValue as any;
        }

        target = target[part];
    }

    return target !== undefined ? target : defaultValue;
};
