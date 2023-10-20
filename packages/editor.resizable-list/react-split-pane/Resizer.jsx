/* eslint-disable no-empty-function */
/* eslint-disable react/prop-types */
// This is a of an unmaintained https://github.com/tomkp/react-split-pane/tree/v2
import React, { Component } from 'react';

import styles from './Resizer.less';

class Resizer extends Component {
    render() {
        const {
            index,
            split = 'vertical',
            onClick = () => {},
            onDoubleClick = () => {},
            onMouseDown = () => {},
            onTouchEnd = () => {},
            onTouchStart = () => {}
        } = this.props;

        const props = {
            ref: (_) => (this.resizer = _),
            'data-attribute': split,
            'data-type': 'Resizer',
            onMouseDown: (event) => onMouseDown(event, index),
            onTouchStart: (event) => {
                event.preventDefault();
                onTouchStart(event, index);
            },
            onTouchEnd: (event) => {
                event.preventDefault();
                onTouchEnd(event, index);
            },
            onClick: (event) => {
                if (onClick) {
                    event.preventDefault();
                    onClick(event, index);
                }
            },
            onDoubleClick: (event) => {
                if (onDoubleClick) {
                    event.preventDefault();
                    onDoubleClick(event, index);
                }
            }
        };

        return split === 'vertical' ? (
            <div className={`${styles.wrapper} ${styles.vertical}`} {...props} />
        ) : (
            <div className={`${styles.wrapper} ${styles.horizontal}`} {...props} />
        );
    }
}

export default Resizer;
