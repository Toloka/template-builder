let lastId = 0;

export const uniqueId = (prefix: string = '') => prefix + String(++lastId);
