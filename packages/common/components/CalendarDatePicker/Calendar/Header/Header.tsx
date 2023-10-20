import React from 'react';
import cx from 'classnames';
import { typeForViewByTypeOfCalendar, clampToMinMax, compareDates, dateAdd } from '../utils';
import './Header.css';
import { calendarLocaleContext } from '../Calendar';

const nextTypeByType = {
    date: 'month',
    month: 'date',
} as const;

type Props = {
    type: 'date' | 'month';
    view: Date | null;
    min: Date | null;
    max: Date | null;
    onChangeView: (date: Date) => void;
    onChangeType: (type: 'date' | 'month') => void;
};

const Control: React.FC<Pick<Props, 'type' | 'view' | 'max' | 'min'> & {
    direction: 'prev' | 'next';
    handleClickControl: (direction: 'prev' | 'next') => void;
}> = ({ view, type, min, max, direction, handleClickControl }) => {
    let hidden;

    let children = null;
    const controlType = typeForViewByTypeOfCalendar[type];

    switch (direction) {
        case 'prev':
            hidden = compareDates(view, 'same', min, controlType);
            children = '«';
            break;
        case 'next':
            hidden = compareDates(view, 'same', max, controlType);
            children = '»';
            break;
        default:
            return null;
    }

    return (
        <th
            className={cx(
                'cc-calendar-header_control',
                'cc-calendar-header_control__selectable',
                'cc-calendar-header_control__compact',
                hidden && 'cc-calendar-header_control__hidden',
            )}
            onClick={() => handleClickControl(direction)}
        >
            {children}
        </th>
    );
};

const Title: React.FC<Pick<Props, 'type' | 'view'> & {
    handleClickTitle: () => void;
}> = ({ view, type, handleClickTitle }) => {
    const locale = React.useContext(calendarLocaleContext);
    const selectable = typeof nextTypeByType[type] !== 'undefined';

    const DateTimeFormat = React.useMemo(
        () =>
            new Intl.DateTimeFormat(locale.locale, {
                year: 'numeric',
                month: type === 'date' ? 'long' : undefined,
            }),
        [locale.locale, type],
    );

    return (
        <th
            className={cx('cc-calendar-header_control', 'cc-calendar-header_control__selectable')}
            onClick={selectable ? handleClickTitle : undefined}
        >
            {DateTimeFormat.format(view || new Date())}
        </th>
    );
};

export const CalendarHeader: React.FC<Props> = ({
    type: providedType,
    view: providedView,
    min,
    max,
    onChangeView,
    onChangeType,
}) => {
    const handleClickControl = React.useCallback(
        (direction: 'prev' | 'next') => {
            const type = typeForViewByTypeOfCalendar[providedType];
            const view = dateAdd(providedView || new Date(), direction === 'next' ? 1 : -1, type);

            onChangeView(clampToMinMax(view, min, max, type)!);
        },
        [max, min, onChangeView, providedType, providedView],
    );

    const handleClickTitle = React.useCallback(() => {
        const type = nextTypeByType[providedType];

        if (!type) {
            return;
        }

        onChangeType(type);
    }, [onChangeType, providedType]);

    return (
        <table className={'cc-calendar-header'}>
            <thead>
                <tr>
                    <Control
                        type={providedType}
                        view={providedView}
                        max={max}
                        min={min}
                        direction="prev"
                        handleClickControl={handleClickControl}
                    />
                    <Title type={providedType} view={providedView} handleClickTitle={handleClickTitle} />
                    <Control
                        type={providedType}
                        view={providedView}
                        max={max}
                        min={min}
                        direction="next"
                        handleClickControl={handleClickControl}
                    />
                </tr>
            </thead>
        </table>
    );
};
