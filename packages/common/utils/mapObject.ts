export const mapObject = <O extends object, R>(obj: O, mapper: (value: O[keyof O], key: keyof O, obj: O) => R) => {
    const mapped: { [key in keyof O]: R } = {} as any;

    Object.keys(obj).forEach((key) => {
        const objKey = key as keyof O;

        mapped[objKey] = mapper(obj[objKey], objKey, obj);
    });

    return mapped;
};
