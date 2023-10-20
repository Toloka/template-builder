import i18n, { InitOptions } from 'i18next';

import { ComponentKeysets, setComponentKeysets } from '../../../../i18n/componentsI18n';

export const setupWorkerI18n = (options: InitOptions, componentKeysets: ComponentKeysets) => {
    i18n.init(options);
    setComponentKeysets(componentKeysets);
};

export const workerI18n = i18n;
