import React from 'react';
import { CalendarIcon } from './CalendarIcon';
import { Calendar, CalendarProps } from './Calendar/Calendar';
import { Popover } from '../Popover';
import { DateInput, DateInputProps } from './DateInput/DateInput';
import './CalendarDatePicker.css';

type Props = DateInputProps & Pick<CalendarProps, 'locale'>;

export const CalendarDatePicker: React.FC<Props> = ({
    value,
    onChange,
    min,
    max,
    withTime,
    placeholder,
    blockList,
    locale,
}) => {
    const [overlayVisible, setOverlayVisible] = React.useState(false);
    const hideOverlay = React.useCallback(() => setOverlayVisible(false), []);
    const showOverlay = React.useCallback(() => setOverlayVisible(true), []);
    const toggleOverlay = React.useCallback(() => setOverlayVisible(x => !x), []);
    const handleChange = React.useCallback(
        (date: Date | null) => {
            onChange(date);
            if (overlayVisible) {
                hideOverlay();
            }
        },
        [hideOverlay, onChange, overlayVisible],
    );

    return (
        <>
            <Popover
                visible={overlayVisible}
                onRequestClose={hideOverlay}
                onRequestOpen={showOverlay}
                content={
                    <Calendar
                        value={value}
                        onChange={handleChange}
                        min={min}
                        max={max}
                        blockList={blockList}
                        locale={locale}
                    />
                }
                trigger="focus"
                position="bottom-right"
                showArrow={false}
            >
                <DateInput
                    value={value}
                    onChange={handleChange}
                    blockList={blockList}
                    min={min}
                    max={max}
                    withTime={withTime}
                    placeholder={placeholder}
                    iconRight={
                        <CalendarIcon exactSize={16} className="cc-calendar-date-picker_icon" onClick={toggleOverlay} />
                    }
                />
            </Popover>
        </>
    );
};
