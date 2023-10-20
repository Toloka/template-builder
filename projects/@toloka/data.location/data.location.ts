import { Core } from '@toloka-tb/core/coreComponentApi';
import { observable } from 'mobx';

type Dispose = () => void;
export type Location = { latitude: number; longitude: number };

export type UserRejectedLocationAccessError = {
    userRejectedLocationAccess: true;
};

export type LocationApi = {
    subscribe: (
        callback: (err: null | Error | UserRejectedLocationAccessError, location?: Location) => void
    ) => Dispose;
};
export type LocationEnvApi = {
    location: LocationApi;
};

const type = '@toloka/data.location';

const currentLocationBox = observable.box<
    | { location: Location; status: 'success' }
    | { error: Error | UserRejectedLocationAccessError; status: 'error' }
    | { status: 'pending' }
>({
    status: 'pending'
});

export const errorLocationValue = {
    unavaliable: 'unavaliable,unavaliable',
    rejected: 'rejected,rejected'
};

export const create = (core: Core, options: { env: LocationEnvApi }) => {
    const subscribeToUserLocation = options.env?.location?.subscribe;

    if (subscribeToUserLocation && currentLocationBox.get().status === 'pending') {
        subscribeToUserLocation((err, location) => {
            if (err) {
                currentLocationBox.set({ error: err, status: 'error' });
            } else if (location) {
                currentLocationBox.set({ location, status: 'success' });
            }
        });
    }

    return {
        type,
        compile: core.helpers.helper(() => {
            const location = currentLocationBox.get();

            switch (location.status) {
                case 'error':
                    // eslint-disable-next-line no-console
                    console.error(location.error);

                    if ('userRejectedLocationAccess' in location.error) {
                        return errorLocationValue.rejected;
                    }

                    return errorLocationValue.unavaliable;
                case 'pending':
                    return errorLocationValue.unavaliable;
                case 'success':
                    return `${location.location.latitude},${location.location.longitude}`;
            }
        })
    };
};
