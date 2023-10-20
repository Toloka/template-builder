import { Child, Core } from '@toloka-tb/core/coreComponentApi';
import * as React from 'react';

import styles from './view.notifications.less';

// This sure should be view.plugin.toloka.notifications
// @internal
export const createViewNotifications = (core: Core) => {
    return core.helpers.viewWithChildren(
        'view.notifications',
        (props: { notifications: Child[]; input: object[] }, bag) => {
            const children: { [key: string]: Child } = {};
            const notifications = props.notifications || [];

            for (let i = 0; i < notifications.length; ++i) {
                const itemBag: typeof bag = {
                    ...bag,
                    data: {
                        local: {
                            inputValues: props.input
                        },
                        relative: [...bag.data.relative]
                    }
                };

                children[i] = core._lowLevel.resolveGetters(notifications[i], itemBag);
            }

            return children;
        },
        (props) => (
            <>
                {props.notifications.map(
                    (_, idx) =>
                        props.children[idx] && (
                            <div className={styles.notification} key={idx}>
                                <div className={styles.notificationBadge} />
                                {props.children[idx]}
                            </div>
                        )
                )}
            </>
        ),
        {
            unresolvableProps: ['notifications']
        }
    );
};
