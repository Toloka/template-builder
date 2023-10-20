export const createData = (type: string, path: string, def?: any) => {
    const data: { type: string; path: string; default?: any } = { type: `data.${type}`, path };

    if (def) {
        data.default = def;
    }

    return data;
};
