import React from 'react';
import cx from 'classnames';
import MaskedInput from 'react-maskedinput';
import { clampToMinMax, compareDates } from '../Calendar/utils';
import '@yandex/ui/__internal__/src/components/Textinput/Textinput.css';
import './DateInput.css';

export type DateInputProps = {
    min?: Date;
    max?: Date;
    blockList?: Date[];
    withTime?: boolean;
    value: Date | null;
    onChange: (date: Date | null) => void;
    iconRight?: React.ReactNode;
    className?: string;
    placeholder?: string;
};

export const DateInput: React.FC<DateInputProps> = ({
    value,
    onChange,
    min = null,
    max = null,
    withTime = false,
    iconRight = null,
    blockList = [],
    className,
    placeholder,
}) => {
    const [invalid, setInvalid] = React.useState(false);
    const setInvalidTimeoutRef = React.useRef(-1);
    const [inInputValue, setInInputValue] = React.useState('');

    const inInputValueRef = React.useRef(inInputValue);
    inInputValueRef.current = inInputValue;

    const formatValue = React.useCallback(
        (value: Date | null) => {
            if (value === null) return;
            if (isNaN(value.getTime())) return;

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

            return withTime ? `${year}-${month}-${date} ${hours}:${minutes}` : `${year}-${month}-${date}`;
        },
        [withTime],
    );

    React.useLayoutEffect(() => {
        setInvalid(false);
        window.clearTimeout(setInvalidTimeoutRef.current);
    }, [value]);

    const handleChange = React.useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const inInputValue = event.target.value;
            let [date, time] = inInputValue.split(' ');

            if (date) {
                let [year, month, day] = date.split('-');

                if (month && parseInt(month, 10) > 12) {
                    month = '12';
                }
                if (month && parseInt(month, 10) < 1) {
                    month = '1';
                }
                if (day && parseInt(day, 10) > 31) {
                    day = '31';
                }
                if (day && parseInt(day, 10) < 1) {
                    day = '01';
                }
                if (day.length === 1) {
                    day = `0${day}`;
                }
                date = [year, month, day].join('-');
            }
            if (time) {
                let [hours, minutes] = time.split(':');
                if (hours && parseInt(hours, 10) > 23) {
                    hours = '23';
                }
                if (minutes && parseInt(minutes, 10) > 59) {
                    minutes = '59';
                }
                time = [hours, minutes].join(':');
            }

            const stringValue = [date, time].join(' ');

            window.clearTimeout(setInvalidTimeoutRef.current);
            setInvalid(false);

            const value = clampToMinMax(new Date(stringValue), min, max, 'time');

            if (value && !isNaN(value?.getTime()) && !inInputValue.includes('_')) {
                if (blockList.some(blockedDate => compareDates(value, 'same', blockedDate, 'date'))) {
                    setInvalid(true);
                } else {
                    onChange(value);
                }
                const newValue = formatValue(value)!;
                if (inInputValueRef.current !== newValue) {
                    setInInputValue(newValue);
                } else {
                    // flushing MaskedInput
                    setInInputValue('');
                    setTimeout(() => setInInputValue(newValue), 0);
                }
            } else {
                setInInputValue(inInputValue);
                setInvalidTimeoutRef.current = window.setTimeout(() => setInvalid(true), 1000);
            }
        },
        [blockList, formatValue, max, min, onChange],
    );

    React.useEffect(() => {
        if (value) {
            const formattedValue = formatValue(value);
            if (formattedValue && inInputValueRef.current !== formattedValue) {
                setInvalid(false);
                setInInputValue(formattedValue);
            }
        } else {
            setInInputValue('');
        }
    }, [formatValue, value]);

    const pattern = React.useMemo(() => (withTime ? '1111-11-11 11:11' : '1111-11-11'), [withTime]);
    return (
        <span
            className={cx(
                'cc-calendar-date-picker_input',
                'Textinput',
                'Textinput_view_default',
                'Textinput_size_s',
                iconRight && 'Textinput_iconRight',
                invalid && 'cc-calendar-date-picker_input__invalid',
                className,
            )}
        >
            {iconRight && <span className="Textinput-Icon Textinput-Icon_side_right">{iconRight}</span>}
            <MaskedInput
                className="Textinput-Control"
                value={inInputValue}
                mask={pattern}
                placeholder={placeholder}
                size={pattern.length}
                onChange={handleChange}
            />
            <span className="Textinput-Box" />
        </span>
    );
};
