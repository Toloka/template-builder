import { Child, Core } from '@toloka-tb/core/coreComponentApi';
import * as React from 'react';

import styles from './view.table.less';

const type = 'view.table';

type Props = { headers?: Child[]; items: Child[][] };

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.viewWithChildren(
            type,
            (props: Props) => {
                const children = core.childrenFromArray(props.headers || [], 'header-');

                for (let row = 0; row < props.items.length; ++row) {
                    Object.assign(children, core.childrenFromArray(props.items[row], `${row}-`));
                }

                return children;
            },
            ({ children, headers, items }) => (
                <table className={styles.table}>
                    {headers && (
                        <thead>
                            <tr>
                                {headers.map((_, index) => (
                                    <th key={index}>{children[`header-${index}`]}</th>
                                ))}
                            </tr>
                        </thead>
                    )}
                    <tbody>
                        {items.map((row, rowIdx) => (
                            <tr key={rowIdx}>
                                {row.map((_, colIdx) => (
                                    <td key={colIdx}>{children[`${rowIdx}-${colIdx}`]}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )
        )
    };
};
