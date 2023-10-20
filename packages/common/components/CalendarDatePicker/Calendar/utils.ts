export const weekStartOffset = 1; // 0 – sunday, 1 – monday etc.

type TimeMeasure = 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'date' | 'week' | 'month' | 'year';
type TimeResetTable = {
    [measute in TimeMeasure]: TimeMeasure[];
};
const timeResetTable: TimeResetTable = {
    milliseconds: [],
    seconds: ['milliseconds'],
    minutes: ['milliseconds', 'seconds'],
    hours: ['milliseconds', 'seconds', 'minutes'],
    date: ['milliseconds', 'seconds', 'minutes', 'hours'],
    week: ['milliseconds', 'seconds', 'minutes', 'hours', 'week'],
    month: ['milliseconds', 'seconds', 'minutes', 'hours', 'date'],
    year: ['milliseconds', 'seconds', 'minutes', 'hours', 'date', 'month'],
};
type TimeEdges = {
    start: {
        [measute in TimeMeasure]: number | ((date: Date) => number);
    };
    end: {
        [measute in TimeMeasure]: number | ((date: Date) => number);
    };
};
const timeEdges: TimeEdges = {
    start: {
        milliseconds: 0,
        seconds: 0,
        minutes: 0,
        hours: 0,
        date: 1,
        week: (date: Date) => date.getDate() - date.getDay() + weekStartOffset,
        month: 0,
        year: -Infinity,
    },
    end: {
        milliseconds: 999,
        seconds: 59,
        minutes: 59,
        hours: 23,
        date: date => new Date(date.getFullYear(), date.getMonth(), 0).getDate(),
        week: date => Math.ceil(new Date(date.getFullYear(), date.getMonth(), 0).getDate() / 7),
        month: 11,
        year: Infinity,
    },
};
type TimeMeasure2setMethod = Partial<
    {
        [measute in TimeMeasure]: keyof Date;
    }
>;
const timeMeasure2setMethod: TimeMeasure2setMethod = {
    milliseconds: 'setMilliseconds',
    seconds: 'setSeconds',
    minutes: 'setMinutes',
    hours: 'setHours',
    date: 'setDate',
    week: 'setDate',
};

export const timeRound = <T extends Date | null>(
    date: T,
    measure: TimeMeasure,
    side: 'start' | 'end' = 'start',
): T extends Date ? Date : null => {
    if (date === null) return null as T extends Date ? Date : null;

    const result = new Date(date as Date);

    const reset = timeResetTable[measure];

    for (let measure of reset) {
        const resetMethod = timeMeasure2setMethod[measure];
        const value = timeEdges[side][measure];
        if (resetMethod) {
            result[resetMethod](typeof value === 'function' ? value(result) : value);
        }
    }

    return result as T extends Date ? Date : null;
};

export const dateAdd = (date: Date, count: number, type: 'year' | 'month' | 'week' | 'date') => {
    const result = new Date(date);
    if (type === 'year') {
        result.setFullYear(date.getFullYear() + count);
    } else if (type === 'month') {
        result.setMonth(date.getMonth() + count);
    } else if (type === 'week') {
        result.setDate(date.getDate() + count * 7);
    } else if (type === 'date') {
        result.setDate(date.getDate() + count);
    }
    return result;
};

export const compareDates = (
    a: Date | null,
    comparator: 'before' | 'after' | 'same',
    b: Date | null,
    measure: 'year' | 'month' | 'week' | 'date',
) => {
    const aRounded = timeRound(a, measure);
    const bRounded = timeRound(b, measure);

    if (comparator === 'same') {
        return aRounded && bRounded ? aRounded.getTime() === bRounded.getTime() : aRounded === bRounded;
    } else if (aRounded && bRounded) {
        return (
            (comparator === 'before' && aRounded.getTime() < bRounded.getTime()) ||
            (comparator === 'after' && aRounded.getTime() > bRounded.getTime())
        );
    }

    return false;
};

export function clampToMinMax(
    value: Date | null,
    min: Date | null,
    max: Date | null,
    measure: 'date' | 'month' | 'year' | 'time',
) {
    if (!value || isNaN(value.getTime())) {
        return value;
    }

    if (measure === 'time') {
        if (min && value.getTime() < min.getTime()) {
            return min;
        }
        if (max && value.getTime() > max.getTime()) {
            return max;
        }
    } else {
        if (compareDates(value, 'before', min, measure)) {
            return timeRound(min, measure);
        }
        if (compareDates(value, 'after', max, measure)) {
            return timeRound(max, measure);
        }
    }

    return value;
}

export const typeForViewByTypeOfCalendar = {
    date: 'month',
    month: 'year',
} as const;
