import { Core, ViewAction } from '@toloka-tb/core/coreComponentApi';

const type = 'action.set-media-status';

export type Status =
    | {
          state: 'new';
      }
    | {
          state: 'loading';
      }
    | {
          state: 'error';
          error: string;
      }
    | {
          state: 'active';
      };

type ActionType = ViewAction<typeof type, Status>;

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.action<ActionType>({
            type,
            uses: ['view', 'payload'],
            apply: (action) => {
                action.view.state.status = action.payload;
            }
        })
    };
};
