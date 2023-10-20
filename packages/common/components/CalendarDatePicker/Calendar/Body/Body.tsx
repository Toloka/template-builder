import React, { Fragment } from 'react';
import './Body.css';
import cx from 'classnames';
import { compareDates, dateAdd, timeRound, weekStartOffset } from '../utils';
import { calendarLocaleContext } from '../Calendar';

type Props = {
    type: 'date' | 'month';
    view: Date;
    value: Date | null;
    min: Date | null;
    max: Date | null;
    blockList: Date[];
    onChange: (value: Date) => void;
};

export const CalendarBody: React.FC<Props> = ({ type, view, value, min, max, onChange, blockList }) => {
    const locale = React.useContext(calendarLocaleContext);

    const getDayInfo = React.useCallback(
        (day: Date) => {
            const selected = compareDates(day, 'same', value, 'date');
            const disabled =
                compareDates(day, 'before', min, 'date') ||
                compareDates(day, 'after', max, 'date') ||
                blockList.some(blockedDate => compareDates(day, 'same', blockedDate, 'date'));
            const outOfCurrentMonth = !compareDates(day, 'same', view, 'month');

            return {
                selected,
                disabled,
                outOfCurrentMonth,
            };
        },
        [blockList, max, min, value, view],
    );

    const getMonthInfo = React.useCallback(
        month => {
            const selected = compareDates(month, 'same', value, 'month');
            const disabled = compareDates(month, 'before', min, 'month') || compareDates(month, 'after', max, 'month');

            return {
                selected,
                disabled,
            };
        },
        [max, min, value],
    );

    const handleChange = React.useCallback(
        (newValue: Date) => {
            let disabled = true;

            switch (type) {
                case 'date':
                    disabled = getDayInfo(newValue).disabled;
                    break;
                case 'month':
                    disabled = getMonthInfo(newValue).disabled;
                    break;
            }

            if (!disabled) {
                const dateTime = new Date(newValue.getTime());

                dateTime.setMilliseconds(value?.getMilliseconds() || 0);
                dateTime.setSeconds(value?.getSeconds() || 0);
                dateTime.setMinutes(value?.getMinutes() || 0);
                dateTime.setHours(value?.getHours() || 0);

                onChange(dateTime);
            }
        },
        [getDayInfo, getMonthInfo, onChange, type, value],
    );

    const WeekdayFormat = React.useMemo(
        () =>
            new Intl.DateTimeFormat(locale.locale, {
                weekday: 'short',
            }),
        [locale.locale],
    );

    const renderWeekdays = React.useCallback(() => {
        const week = timeRound(view, 'week');

        return (
            <tr key="weekdays">
                {new Array(7).fill(0).map((_, weekday) => (
                    <th className={cx('cc-calendar-body_cell', 'cc-calendar-body_cell__small')} key={weekday}>
                        {WeekdayFormat.format(dateAdd(week, weekday, 'date'))}
                    </th>
                ))}
            </tr>
        );
    }, [WeekdayFormat, view]);

    const renderWeek = React.useCallback(
        (week: Date) => {
            return (
                <tr key={week.getTime()}>
                    {new Array(7).fill(0).map((_, weekday) => {
                        const day = dateAdd(week, weekday, 'date');
                        const { selected, disabled, outOfCurrentMonth } = getDayInfo(day);

                        const selectable = !selected && !disabled;

                        return (
                            <td
                                key={weekday}
                                onClick={
                                    selectable
                                        ? () => handleChange(day)
                                        : undefined /* eslint-disable-line no-undefined */
                                }
                                className={cx(
                                    'cc-calendar-body_cell',
                                    'cc-calendar-body_cell__small',
                                    (disabled || outOfCurrentMonth) && 'cc-calendar-body_cell__gray',
                                    selectable && 'cc-calendar-body_cell__selectable',
                                    selected && 'cc-calendar-body_cell__selected',
                                )}
                            >
                                {day.getDate()}
                            </td>
                        );
                    })}
                </tr>
            );
        },
        [getDayInfo, handleChange],
    );

    const renderWeeks = React.useCallback(() => {
        const weeks = [];
        let week = timeRound(view, 'month');

        let offset = week.getDay() - weekStartOffset;

        if (offset < 0) offset += 7;

        week = dateAdd(week, -1 * offset, 'date');

        while (!compareDates(week, 'after', view, 'month')) {
            weeks.push(week);
            week = dateAdd(week, 1, 'week');
        }

        return (
            <Fragment>
                <thead>{renderWeekdays()}</thead>
                <tbody>{weeks.map(week => renderWeek(week))}</tbody>
            </Fragment>
        );
    }, [renderWeek, renderWeekdays, view]);

    const MonthFormat = React.useMemo(
        () =>
            new Intl.DateTimeFormat(locale.locale, {
                month: 'short',
            }),
        [locale.locale],
    );

    const renderMonth = React.useCallback(
        (month: Date) => {
            const { disabled, selected } = getMonthInfo(month);

            return (
                <td
                    key={month.getTime()}
                    onClick={!disabled ? () => handleChange(month) : undefined}
                    className={cx(
                        'cc-calendar-body_cell',
                        'cc-calendar-body_cell__big',
                        disabled && 'cc-calendar-body_cell__gray',
                        !disabled && 'cc-calendar-body_cell__selectable',
                        selected && 'cc-calendar-body_cell__selected',
                    )}
                >
                    {MonthFormat.format(month)}
                </td>
            );
        },
        [MonthFormat, getMonthInfo, handleChange],
    );
    const renderMonths = React.useCallback(() => {
        return (
            <tbody key="months">
                {new Array(3).fill(0).map((_, row) => (
                    <tr key={row}>
                        {new Array(4)
                            .fill(0)
                            .map((_, column) =>
                                renderMonth(dateAdd(timeRound(view, 'year'), row * 4 + column, 'month')),
                            )}
                    </tr>
                ))}
            </tbody>
        );
    }, [renderMonth, view]);

    return <table className="cc-calendar-body">{type === 'month' ? renderMonths() : renderWeeks()}</table>;
};
