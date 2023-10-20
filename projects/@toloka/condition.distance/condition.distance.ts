import { errorLocationValue } from '@toloka/data.location';
import { Core } from '@toloka-tb/core/coreComponentApi';

import translations from './i18n/condition.distance.translations';
import { distanceBetweenEarthCoordinates } from './utils';

const type = '@toloka/condition.distance';

type TolokaLocation = string; // to be typed as `${number},${number}` in TS 4+

export type ConditionDistanceProps = {
    max: number;
    from: TolokaLocation;
    to: TolokaLocation;
};

export const create = (core: Core) => {
    const resolve = (
        max: number,
        from: TolokaLocation,
        to: TolokaLocation
    ):
        | { passed: true }
        | { passed: false; reason: 'accessRejected' | 'locationUnavailable' }
        | { passed: false; reason: 'invalidProp'; property: string; value: any }
        | { passed: boolean; reason: 'distance'; currentDistance: number } => {
        if (typeof max !== 'number') {
            return { passed: false, reason: 'invalidProp', property: 'max', value: max };
        }
        if (typeof from !== 'string') {
            return { passed: false, reason: 'invalidProp', property: 'from', value: from };
        }
        if (typeof to !== 'string') {
            return { passed: false, reason: 'invalidProp', property: 'to', value: to };
        }

        if ([from, to].some((point) => point === errorLocationValue.rejected)) {
            return { passed: false, reason: 'accessRejected' };
        }
        if ([from, to].some((point) => point === errorLocationValue.unavaliable)) {
            return { passed: false, reason: 'locationUnavailable' };
        }

        const [latitudeFrom, longitudeFrom] = from.split(',').map((value) => parseFloat(value));
        const [latitudeTo, longitudeTo] = to.split(',').map((value) => parseFloat(value));

        if ([latitudeFrom, longitudeFrom].some((coord) => isNaN(coord))) {
            return { passed: false, reason: 'invalidProp', property: 'from', value: from };
        }
        if ([latitudeTo, longitudeTo].some((coord) => isNaN(coord))) {
            return { passed: false, reason: 'invalidProp', property: 'to', value: to };
        }

        const distance = distanceBetweenEarthCoordinates(latitudeFrom, longitudeFrom, latitudeTo, longitudeTo);

        return { passed: distance <= max, reason: 'distance', currentDistance: distance };
    };

    return {
        type,
        compile: core.helpers.conditionV2<ConditionDistanceProps, keyof typeof translations.ru>(
            type,
            (props) => resolve(props.max, props.from, props.to).passed,
            (t, props) => {
                const resolution = resolve(props.max, props.from, props.to);

                if (resolution.passed) {
                    return { opposite: () => ({ message: '' }), direct: () => ({ message: '' }) };
                }

                if (resolution.reason === 'distance') {
                    const interpolation = {
                        required: props.max,
                        current: resolution.currentDistance
                    };

                    return {
                        direct: () => ({ message: t('tooFar', interpolation) }),
                        opposite: () => ({ message: t('tooClose', interpolation) })
                    };
                }
                if (resolution.reason === 'invalidProp') {
                    const interpolation = {
                        property: String(resolution.property),
                        value: String(resolution.value)
                    };

                    return {
                        direct: () => ({ message: t('invalidProp', interpolation) }),
                        opposite: () => ({ message: t('invalidProp', interpolation) })
                    };
                }

                return {
                    direct: () => ({ message: t(resolution.reason) }),
                    opposite: () => ({ message: t(resolution.reason) })
                };
            }
        )
    };
};

export { translations };
