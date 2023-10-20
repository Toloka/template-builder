import React, { useMemo } from 'react';

import { useRotate } from '../hooks/useRotate';

const noop = () => '';

interface MethodsContext {
    onRotate: (id: string) => void;
    resetRotate: (id: string) => void;
}

const rotateStateContext = React.createContext<Record<string, number>>({});
const rotateMethodsContext = React.createContext<MethodsContext>({
    onRotate: noop,
    resetRotate: noop
});

export const useRotateState = () => React.useContext(rotateStateContext);
export const useRotateMethods = () => React.useContext(rotateMethodsContext);

export const RotateContext: React.FC = ({ children }) => {
    const [rotatePositions, onRotate, resetRotate] = useRotate();
    const methods = useMemo(() => ({ onRotate, resetRotate }), [onRotate, resetRotate]);

    return (
        <rotateStateContext.Provider value={rotatePositions}>
            <rotateMethodsContext.Provider value={methods}>{children}</rotateMethodsContext.Provider>
        </rotateStateContext.Provider>
    );
};
