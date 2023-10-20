export const getExtension = (name: string) => {
    if (!name) return '';
    const extension = name.split('.').pop() || '';

    if (extension === name) return '';

    return extension.trim().toUpperCase();
};

export const removeExtention = (name: string) => {
    if (!name) return '';
    const parts = name.split('.');
    const extension = parts.pop() || '';

    if (extension === name) return name;

    return parts
        .join('.')
        .trim()
        .toLowerCase();
};
