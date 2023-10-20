import { Core, FieldProps } from '@toloka-tb/core/coreComponentApi';
import { CalendarDatePicker } from '@toloka-tb/common/components/CalendarDatePicker';
import * as React from 'react';

import translations from './i18n/field.date.translations';

const type = 'field.date';

type FieldDateProps = FieldProps<string> &
    Partial<{
        placeholder: string;
        min: string;
        max: string;
        blockList: string[];
    }> & {
        format: 'date-time' | 'date';
    };

const isDateValid = (date: string | undefined) => {
    if (!date) {
        return false;
    }
    if (isNaN(new Date(date).getTime())) {
        return false;
    }

    return /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})Z/.test(date);
};

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.field<FieldDateProps>(
            type,
            (props) => {
                const t = core.i18n.useTranslation<keyof typeof translations.ru>(type);

                const string2date = React.useCallback(
                    <T extends null | undefined = null>(value: string | undefined, invalidFallback: T): T | Date => {
                        if (value === undefined) {
                            return invalidFallback;
                        }

                        const date = new Date(value);

                        if (isNaN(date.getTime())) {
                            return invalidFallback;
                        }

                        return date;
                    },
                    []
                );
                const handleChange = React.useCallback(
                    (providedValue: Date | null) => {
                        if (providedValue === null) {
                            props.onChange(undefined);

                            return;
                        }

                        const value = new Date(providedValue);

                        const timeZoneOffsetSign = value.getTimezoneOffset() < 0 ? -1 : 1;
                        const timeZoneOffsetHours =
                            Math.floor(Math.abs(value.getTimezoneOffset()) / 60) * timeZoneOffsetSign;
                        const timeZoneOffsetMinutes =
                            Math.floor(Math.abs(value.getTimezoneOffset()) % 60) * timeZoneOffsetSign;

                        value.setHours(value.getHours() + timeZoneOffsetHours);
                        value.setMinutes(value.getMinutes() + timeZoneOffsetMinutes);

                        const year = value.getFullYear();
                        const month = (value.getMonth() + 1).toString().padStart(2, '0');
                        const date = value
                            .getDate()
                            .toString()
                            .padStart(2, '0');
                        const hours = value
                            .getHours()
                            .toString()
                            .padStart(2, '0');
                        const minutes = value
                            .getMinutes()
                            .toString()
                            .padStart(2, '0');
                        const seconds = value
                            .getSeconds()
                            .toString()
                            .padStart(2, '0');

                        props.onChange(`${year}-${month}-${date}T${hours}:${minutes}:${seconds}Z`);
                    },
                    [props]
                );

                if (!['date-time', 'date'].includes(props.format)) {
                    return <div>{t('unknownFormat', { format: props.format })}</div>;
                }
                if (props.max && !isDateValid(props.max)) {
                    return <div>{t('errorMax', { max: props.max })}</div>;
                }
                if (props.min && !isDateValid(props.min)) {
                    return <div>{t('errorMin', { min: props.min })}</div>;
                }
                if (props.blockList && !props.blockList.every(isDateValid)) {
                    const invalidIndexes = props.blockList
                        .map((date, index) => ({ date, index }))
                        .filter(({ date }) => !isDateValid(date))
                        .map(({ index }) => index);

                    return <div>{t('errorBlocklist', { invalidIndexes: invalidIndexes.join(', ') })}</div>;
                }

                return (
                    <CalendarDatePicker
                        value={string2date(props.value, null)}
                        onChange={handleChange}
                        placeholder={props.placeholder}
                        withTime={props.format === 'date-time'}
                        min={string2date(props.min, undefined)}
                        max={string2date(props.max, undefined)}
                        blockList={(props.blockList || []).map((dateString) => new Date(dateString))}
                        locale={{ locale: t('locale'), clear: t('clear') }}
                    />
                );
            },
            {
                transformers: [core.fieldTransformers.emptyStringTransformer]
            }
        )
    };
};

export { translations };
