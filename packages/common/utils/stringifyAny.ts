export const stringifyAny = (rawValue: unknown, typeofPrefix = false) => {
    let stringified: string;

    if (typeof rawValue !== 'object') {
        stringified = String(rawValue);
    } else {
        const circularStructureProtectionCache: any[] = [];

        stringified = JSON.stringify(rawValue, (_, value) => {
            if (typeof value === 'object' && value !== null) {
                if (circularStructureProtectionCache.includes(value)) return '[Circular]';

                circularStructureProtectionCache.push(value);
            }

            return value;
        });
    }

    if (typeofPrefix) {
        return `${typeof rawValue}-${stringified}`;
    }

    return stringified;
};
