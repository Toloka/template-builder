import { LocationApi } from '@toloka/data.location';

export const createLocationApiMock = (): LocationApi => {
    return {
        subscribe: (callback) => {
            callback(null, { latitude: 55.733969, longitude: 37.587093 });

            return () => ({
                /* no real subscription */
            });
        }
    };
};
