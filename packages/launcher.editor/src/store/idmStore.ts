/*
    Frontend IDM
    Used just to hide service-specific components from non-related users.
*/

import { JSONConfig } from '@toloka-tb/core/compileConfig/compileConfig';
import { action, observable, reaction, runInAction, toJS, when } from 'mobx';

import { setFrontendIdm } from '../components/Editor/lang/typeHandlers/typeHandlers';
import { configStore, workerContainer } from './configStore';
import { defaultConfig } from './defaults';

type FrontendIdm = { [service: string]: boolean };
const initValue: FrontendIdm = {
    '@toloka': false,
};

const localStorageKey = `tb-front-idm-mock`;

try {
    const storageValue = JSON.parse(localStorage.getItem(localStorageKey) || '{}');

    for (const key in storageValue) {
        if (key in initValue) {
            (initValue as any)[key] = (storageValue as any)[key];
        }
    }
} catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
}

export const idmStore = observable<FrontendIdm>(initValue);

reaction(
    () => toJS(idmStore),
    (idmStore) => {
        workerContainer.current.setFrontendIdm({ ...idmStore } as typeof initValue); // validation in the service worker
        setFrontendIdm({ ...(idmStore as FrontendIdm) }); // autocomplete in the main thread
    },
    { fireImmediately: true }
);

const idmUnlockHash: { [service: string]: string } = {
    '@toloka': `#toloka-components-QcGFetU6Kfeep9FumtLWGtvDFhW2fj8C`,
};
const resetFrontendIdmHash = `#tb-front-idm-mock-reset`;

const saveIdmStore = () => {
    try {
        localStorage.setItem(localStorageKey, JSON.stringify(idmStore));
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
    }
};

export const unlockServices = action((services: string[], save = true) => {
    let frontendIdmChanged = false;

    if (location.hash === resetFrontendIdmHash) {
        frontendIdmChanged = true;
        for (const key in idmStore) {
            idmStore[key as keyof FrontendIdm] = false;
        }
    } else {
        for (const service of services) {
            if (!idmStore[service as keyof FrontendIdm]) {
                idmStore[service as keyof FrontendIdm] = true;
                frontendIdmChanged = true;
            }
        }
    }

    if (frontendIdmChanged && save) {
        saveIdmStore();
    }

    return frontendIdmChanged;
});

runInAction(() => {
    const services = Object.keys(idmUnlockHash).filter((service) => location.hash === idmUnlockHash[service]);

    if (services.length > 0) {
        if (unlockServices(services)) {
            window.close();
        }
    }
});

const unlockAllComponentsByConfig = (config: JSONConfig) => {
    const unlockedServices: { [service: string]: true } = {};
    const traverse = (chunk: any, depth = 0) => {
        if (typeof chunk !== 'object' || chunk === null || depth > 100000) return;
        if ('type' in chunk && typeof chunk.type === 'string') {
            const type: string = chunk.type;

            if (type.startsWith('@')) {
                const service = type.split('/')[0];

                if (service in initValue) {
                    unlockedServices[service] = true;
                }
            }
        }
        Object.values(chunk).map((property) => typeof property === 'object' && traverse(property, depth + 1));
    };

    traverse(config);

    const unlockedServicesList = Object.keys(unlockedServices);

    unlockServices(unlockedServicesList);
};

when(
    () => JSON.stringify(configStore.valid, null, 2) !== JSON.stringify(defaultConfig(), null, 2),
    () => unlockAllComponentsByConfig(configStore.valid)
);

/*
Unlock example
prod: https://tb.toloka.dev/editor##toloka-components-QcGFetU6Kfeep9FumtLWGtvDFhW2fj8C
local: http://localhost:8080/#zen-components-QcGFetU6Kfeep9FumtLWGtvDFhW2fj8C

Reset example
prod: https://tb.toloka.dev/editor#tb-front-idm-mock-reset
local: http://localhost:8080/#tb-front-idm-mock-reset
*/
