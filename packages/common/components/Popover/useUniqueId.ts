import React from 'react';
import { uniqueId } from '../../utils/uniqueId';

export const useUniqueId = (prefix = 'unique') => {
    const container = React.useRef(prefix);
    React.useEffect(() => {
        container.current = uniqueId(prefix);
    }, [prefix]);
    return container.current;
};
