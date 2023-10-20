import { Alert, AlertProps } from '@toloka-tb/common/UI/Alert/Alert';
import { Child, Core } from '@toloka-tb/core/coreComponentApi';
import * as React from 'react';

type ViewAlertProps = AlertProps & {
    content: Child;
};

const type = 'view.alert';

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.viewWithChildren(
            type,
            (props: ViewAlertProps) => ({ content: props.content }),
            ({ children, theme }) => <Alert theme={theme}>{children.content}</Alert>
        )
    };
};
