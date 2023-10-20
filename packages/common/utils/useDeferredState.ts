import React from 'react';

export const useDeferredState = <B>(baseState: B, instantValues: B[], defferFor = 500) => {
    const [deffered, setDeffered] = React.useState(baseState);

    React.useLayoutEffect(() => {
        const value = baseState;

        if (deffered !== value) {
            if (instantValues.includes(value)) {
                setDeffered(value);
            } else {
                const timeout = window.setTimeout(() => {
                    setDeffered(value);
                }, defferFor);

                return () => window.clearTimeout(timeout);
            }
        }
    }, [baseState, defferFor, deffered, instantValues]);

    return deffered;
};
