/* eslint-disable react/prop-types */
// This is a of an unmaintained https://github.com/tomkp/react-split-pane/tree/v2
import React, { PureComponent } from 'react';

import { convertSizeToCssValue, getUnit } from './SplitPane';

const getPaneStyle = ({ split, initialSize, size, minSize, maxSize, resizersSize }) => {
    const value = size || initialSize;
    const vertical = split === 'vertical';
    const styleProp = {
        minSize: vertical ? 'minWidth' : 'minHeight',
        maxSize: vertical ? 'maxWidth' : 'maxHeight',
        size: vertical ? 'width' : 'height'
    };

    const style = {
        display: 'flex',
        outline: 'none'
    };

    style[styleProp.minSize] = convertSizeToCssValue(minSize, resizersSize);
    style[styleProp.maxSize] = convertSizeToCssValue(maxSize, resizersSize);

    switch (getUnit(value)) {
        case 'ratio':
            style.flex = value;
            break;
        case '%':
        case 'px':
            style.flexGrow = 0;
            style[styleProp.size] = convertSizeToCssValue(value, resizersSize);
            break;
    }

    return style;
};

class Pane extends PureComponent {
    setRef = (element) => {
        this.props.innerRef(element);
    };

    render() {
        const { children, className } = this.props;

        return (
            <div className={className} style={getPaneStyle(this.props)} ref={this.setRef}>
                {children}
            </div>
        );
    }
}

/*
Pane.propTypes = {
    children: PropTypes.node,
    innerRef: PropTypes.func,
    className: PropTypes.string,
    initialSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    minSize: PropTypes.string,
    maxSize: PropTypes.string
};
*/

Pane.defaultProps = {
    initialSize: '1',
    split: 'vertical',
    minSize: '0',
    maxSize: '100%'
};

export default Pane;
