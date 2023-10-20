import { Child, Core } from '@toloka-tb/core/coreComponentApi';

import { createNotifications } from './view.notifications/Notifications';

const type = 'plugin.toloka';

export type Layout =
    | {
          kind: 'scroll';
          taskWidth: '100%' | number | undefined;
      }
    | {
          kind: 'pager';
          taskWidth: '100%' | number | undefined;
      }
    | {
          kind: 'first-task-only'; // DEPRECATED
          taskWidth: '100%' | number | undefined;
      };
export type Notifications = React.FC<{ input: object[] }>;

export type TolokaEnvApi = {
    setTolokaLayout: (layout: Layout) => void;
    setTolokaNotificationsV2: (notifications: Notifications) => void;
};

export type PluginTolokaProps = {
    layout?: Layout;
    notifications?: Child[];
};

export const create = (core: Core, options: { env: TolokaEnvApi }) => {
    return {
        type,
        compile: core.helpers.plugin((props: PluginTolokaProps) => {
            const env = options.env;

            if (props.layout && env.setTolokaLayout) {
                env.setTolokaLayout(props.layout);
            }

            return {
                init: (bag) => {
                    const notifications = props.notifications;

                    if (notifications && env.setTolokaNotificationsV2) {
                        const Notifications = createNotifications(bag, notifications);

                        env.setTolokaNotificationsV2(Notifications);
                    }

                    return { name: type, type: 'effect' };
                }
            };
        })
    };
};
