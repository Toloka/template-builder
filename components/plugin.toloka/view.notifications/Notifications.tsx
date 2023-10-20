import { Child } from '@toloka-tb/core/coreComponentApi';
import { CtxBag } from '@toloka-tb/core/ctx/ctxBag';
import * as React from 'react';

import { createViewNotifications } from './view.notifications';

export const createNotifications = (bag: CtxBag, notifications: Child[]) => {
    const Notifications: React.FC<{ input: object[] }> = ({ input }) => {
        const core = bag.tb.config.core!;

        const compiled = createViewNotifications(core);
        const notificationsConfig = {
            view: compiled({ notifications, input }),
            core,
            plugins: []
        };

        const ctx = core.makeCtxV2(notificationsConfig, bag.tb.input, bag.tb.intl);

        return <ctx.Component ctx={ctx} />;
    };

    return Notifications;
};
