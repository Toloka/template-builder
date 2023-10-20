import React from 'react';
import './Footer.css';
import { calendarLocaleContext } from '../Calendar';

type Props = {
    value: Date | null;
    onClear: () => void;
};

export const CalendarFooter: React.FC<Props> = ({ value, onClear }) => {
    const locale = React.useContext(calendarLocaleContext);

    return (
        <table className={'cc-calendar-footer'}>
            <tfoot>
                {value !== null && !isNaN(value.getTime()) && (
                    <tr>
                        <th className={'cc-calendar-footer_button'} onClick={onClear}>
                            {locale.clear}
                        </th>
                    </tr>
                )}
            </tfoot>
        </table>
    );
};
