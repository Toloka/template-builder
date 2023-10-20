export const getArchetype = (
    type: string
): undefined | string | 'view' | 'layout' | 'field' | 'condition' | 'action' | 'plugin' | 'data' | 'helper' => {
    if (type.startsWith('@') && type.includes('/')) {
        const pureType = type.split('/')[1];

        return pureType.split('.')[0];
    }

    return type.split('.')[0];
};
