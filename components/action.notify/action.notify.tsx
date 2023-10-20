import { IconCloseSmall } from '@toloka-tb/common/icons/closeSmall';
import { uniqueId } from '@toloka-tb/common/utils/uniqueId';
import { ContextualAction, Core } from '@toloka-tb/core/coreComponentApi';
import cx from 'classnames';
import { Spin } from '@toloka-tb/common/components/Spin';
import { observable } from 'mobx';
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { render } from 'react-dom';

import styles from './action.notify.less';
import translations from './i18n/action.notify.translations';

const defaultDuration = 4500;

type NotificationTheme = 'danger' | 'success' | 'warning' | 'info';
type NotificationObject = {
    id: string;
    disappearing: boolean;
    created: number;
    height: number | null;

    content: string;
    theme: NotificationTheme;
    spin: boolean;
    durationPromise: Promise<unknown>;
};

export type Notification = Partial<Pick<NotificationObject, 'theme' | 'spin'>> &
    Pick<NotificationObject, 'content'> & {
        delay?: number | Promise<unknown>;
        duration?: number | Promise<unknown>;
    };

const queue: NotificationObject[] = observable([]);

const removeNotification = (notificationId: string) => {
    const notificationIndex = queue.findIndex((notification) => notification.id === notificationId);

    if (notificationIndex !== -1) {
        queue.splice(notificationIndex, 1);
    }
};
const hideNotification = (notificationId: string) => {
    const notificationIndex = queue.findIndex((notification) => notification.id === notificationId);

    if (notificationIndex !== -1) {
        queue[notificationIndex].disappearing = true;
        queue[notificationIndex].height = 0;

        setTimeout(() => removeNotification(notificationId), 100);
    }
};
const handleNotificationSize = (node: HTMLDivElement | null, notification: NotificationObject) => {
    if (notification.height !== null || node === null) {
        return;
    }

    const { height } = node.getBoundingClientRect();
    const notificationIndex = queue.findIndex(({ id }) => notification.id === id);

    if (notificationIndex !== -1) {
        queue[notificationIndex].height = height;
    }
};

const Notifications: React.FC<{}> = observer(() => (
    <div className={styles.container}>
        {queue.map((notification) => (
            <div
                className={cx(
                    styles.notification,
                    styles[notification.theme],
                    notification.disappearing && styles.disappear
                )}
                style={{ height: notification.height || 0 }}
                key={notification.id}
            >
                <div className={styles.notificationInner} ref={(node) => handleNotificationSize(node, notification)}>
                    {notification.spin && <Spin size="xxs" />}
                    <span className={styles.text}>{notification.content}</span>
                    <button className={styles.closeButton} onClick={() => hideNotification(notification.id)}>
                        <IconCloseSmall className={styles.icon} width="12" height="12" viewBox="0 0 12 12" />
                    </button>
                </div>
            </div>
        ))}
    </div>
));

let notifyContainer: HTMLDivElement | null = null;

export const notify = (notification: Notification) => {
    if (!notifyContainer) {
        notifyContainer = document.createElement('div');

        document.body.appendChild(notifyContainer);

        render(<Notifications />, notifyContainer);
    }
    let durationPromise = new Promise((resolve) => setTimeout(resolve, defaultDuration));

    if (typeof notification.duration === 'number') {
        durationPromise = new Promise((resolve) => setTimeout(resolve, notification.duration as number));
    } else if (notification.duration instanceof Promise) {
        durationPromise = notification.duration;
    }
    const notificationObject = {
        theme: notification.theme || ('info' as NotificationTheme),
        content: notification.content,
        spin: notification.spin || false,

        durationPromise,
        created: Date.now(),
        id: uniqueId('notification'),
        disappearing: false,
        height: null
    };

    let canceled = false;

    const show = () => {
        if (!canceled) {
            queue.push(notificationObject);
        }
    };
    const hide = () => {
        hideNotification(notificationObject.id);
        canceled = true;
    };

    if (typeof notification.delay === 'number') {
        setTimeout(show, notification.delay);
    } else if (notification.delay instanceof Promise) {
        notification.delay.then(show);
        notification.delay.catch(show);
    } else {
        show();
    }

    // forcing types due to using mobx proxies
    (notificationObject.durationPromise as Promise<any>).then(hide);
    (notificationObject.durationPromise as Promise<any>).catch(hide);
};

const type = 'action.notify';

type ActionType = ContextualAction<typeof type, Notification>;

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.action<ActionType>({
            type,
            uses: ['payload', 'ctxBag'],
            apply: (action) => {
                const t = core.i18n.makeTranslator(action.ctxBag!, type);

                const notification = action.payload.content
                    ? action.payload
                    : { ...action.payload, content: t('empty') };

                notify(notification);
            }
        })
    };
};

export { translations };
