import * as React from 'react';

export const makeIcon = (
    path: React.ReactNode | (() => React.ReactNode),
    name = 'Icon',
    baseProps: React.SVGProps<SVGElement> = {}
) => {
    const Icon: React.FC<React.SVGProps<SVGElement>> = (props) => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            {...baseProps}
            {...(props as any)}
        >
            {typeof path === 'function' ? path() : path}
            {props.children}
        </svg>
    );

    Icon.displayName = name;

    return Icon;
};
