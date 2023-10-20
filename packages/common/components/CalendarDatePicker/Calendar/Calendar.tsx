import React from 'react';
import cx from 'classnames';
import './Calendar.css';
import { CalendarHeader } from './Header/Header';
import { clampToMinMax } from './utils';
import { CalendarBody } from './Body/Body';
import { CalendarFooter } from './Footer/Footer';

const defaultLocale = { locale: 'en', clear: 'Clear' };
export const calendarLocaleContext = React.createContext(defaultLocale);

export type CalendarProps = {
    value: Date | null;
    min?: Date;
    max?: Date;
    blockList?: Date[];
    onChange: (date: Date | null) => void;
    className?: string;
    innerRef?: React.Ref<HTMLDivElement>;
    clearable?: boolean;
    locale?: {
        locale: string;
        clear: string;
    };
};

export const Calendar: React.FC<CalendarProps> = ({
    value = null,
    min = null,
    max = null,
    onChange,
    className,
    innerRef,
    clearable = true,
    locale = defaultLocale,
    blockList = [],
}) => {
    const [type, setType] = React.useState<'date' | 'month'>('date');
    const [view, setView] = React.useState(value || new Date());
    const clampedView = React.useMemo(() => clampToMinMax(view, min, max, 'month')!, [max, min, view]);

    const handleChangeType = React.useCallback((type: 'date' | 'month') => {
        setType(type || 'date');
    }, []);
    const handleClear = React.useCallback(() => onChange(null), [onChange]);
    const handleChangeValue = React.useCallback(
        (value: Date) => {
            switch (type) {
                case 'month':
                    setView(value);
                    setType('date');
                    break;
                case 'date':
                    onChange(value);
                    break;
            }
        },
        [onChange, type],
    );

    return (
        <calendarLocaleContext.Provider value={locale}>
            <div className={cx('cc-calendar', className)} ref={innerRef}>
                <CalendarHeader
                    type={type}
                    view={clampedView}
                    min={min}
                    max={max}
                    onChangeType={handleChangeType}
                    onChangeView={setView}
                />
                <CalendarBody
                    blockList={blockList}
                    type={type}
                    view={clampedView}
                    value={value}
                    min={min}
                    max={max}
                    onChange={handleChangeValue}
                />
                {clearable && <CalendarFooter value={value} onClear={handleClear} />}
            </div>
        </calendarLocaleContext.Provider>
    );
};
