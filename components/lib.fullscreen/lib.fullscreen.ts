import { OpenCloseActionType } from '@toloka-tb/action.open-close';
import { Core, CreateOptions } from '@toloka-tb/core/coreComponentApi';
import { Compile, Getter } from '@toloka-tb/core/resolveGetters/resolveGetters';
import { useCallback, useEffect, useState } from 'react';

export const createUseSyncFullscreen = (
    core: Core,
    createOptions: CreateOptions,
    openClose: Compile<Omit<OpenCloseActionType, 'type'>, Getter<OpenCloseActionType>>
) => {
    const useSyncFullscreen = (isOpen: boolean) => {
        const [fullscreenState, setFullscreenState] = useState(isOpen);

        const [toggleOpenClose] = core.hooks.useComponentActions([openClose]);

        const toggleFullscreen = useCallback(() => {
            (createOptions.env.toggleFullscreen ? createOptions.env.toggleFullscreen() : Promise.resolve(isOpen)).then(
                (res: boolean) => {
                    setFullscreenState(res);
                    if (isOpen !== res) {
                        toggleOpenClose(res);
                    }
                }
            );
        }, [isOpen, toggleOpenClose]);

        useEffect(() => {
            if (Boolean(isOpen) !== Boolean(fullscreenState)) {
                toggleFullscreen();
            }
            // sync states only on isOpen changes
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [isOpen]);

        useEffect(() => {
            const handler = ({ data }: { data: boolean }) => {
                setFullscreenState(data);
                if (!data && isOpen !== data) {
                    toggleOpenClose(data);
                }
            };

            if (createOptions.env.onFullscreenChange) {
                createOptions.env.onFullscreenChange(handler);
            }

            return () => createOptions.env.offFullscreenChange?.(handler);
        }, [isOpen, toggleOpenClose]);

        return [isOpen, toggleFullscreen] as const;
    };

    return useSyncFullscreen;
};
