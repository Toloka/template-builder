import { create as createOpenClose } from '@toloka-tb/action.open-close';
import { create as createPlayPause } from '@toloka-tb/action.play-pause';
import { create as createSetCurrentTime } from '@toloka-tb/action.set-current-time';
import { create as createSetDuration } from '@toloka-tb/action.set-duration';
import { create as createSetStatus, Status } from '@toloka-tb/action.set-media-status';
import { create as createSetVolume } from '@toloka-tb/action.set-volume';
import { Core } from '@toloka-tb/core/coreComponentApi';
import * as React from 'react';

import translations from './i18n/lib.player.translations';

export { createUsePlayerStore, createPlayerStore, PlayerStore, PlayerError } from './lib.player.v2';

export interface PlayerState {
    isPlaying: boolean;
    isOpen?: boolean;
    duration: number;
    volume: number;
    currentTime: number;
    status: Status;
    wasPlayed: boolean;
    wasPlayedFully: boolean;
}

export interface PlayerStateChangeDispatcher {
    updateCurrentTime: (currentTime: number) => void;
    updateVolume: (volume: number) => void;
    updateDuration: (duration: number) => void;
    updateStatus: (status: Status) => void;
    play: () => void;
    pause: () => void;
    enterFullscreen: () => void;
    exitFullscreen: () => void;
    reset: () => void;
}

const defaultInitState = {
    isPlaying: false,
    isOpen: false,
    volume: 1,
    currentTime: 0,
    duration: 0,
    status: { state: 'new' },
    wasPlayed: false,
    wasPlayedFully: false
} as const;

export const createUsePlayerState = (core: Core) => {
    const openClose = createOpenClose(core).compile;
    const playPause = createPlayPause(core).compile;
    const setCurrentTime = createSetCurrentTime(core).compile;
    const setDuration = createSetDuration(core).compile;
    const setVolume = createSetVolume(core).compile;
    const setMediaStatus = createSetStatus(core).compile;

    const usePlayerState = (
        onStateChange: (state: PlayerState, mediaChangeDispatcher: PlayerStateChangeDispatcher) => void,
        url: string
    ): [PlayerState, PlayerStateChangeDispatcher] => {
        const t = core.i18n.useTranslation<keyof typeof translations.ru>('lib.player');
        const loadingFailedTimeout = React.useRef<ReturnType<typeof window.setTimeout>>(0);
        const state = core.hooks.useComponentState(defaultInitState);
        const isOpenRef = React.useRef<Boolean>(Boolean(state.isOpen));
        const isPlayingRef = React.useRef<Boolean>(Boolean(state.isPlaying));

        isOpenRef.current = Boolean(state.isOpen);
        isPlayingRef.current = Boolean(state.isPlaying);

        const [
            updateCurrentTime,
            updateVolume,
            updateDuration,
            setStatus,
            togglePlayPause,
            toggleFullscreen
        ] = core.hooks.useComponentActions([
            setCurrentTime,
            setVolume,
            setDuration,
            setMediaStatus,
            playPause,
            openClose
        ]);

        const play = React.useCallback(() => !isPlayingRef.current && togglePlayPause(), [togglePlayPause]);
        const pause = React.useCallback(() => isPlayingRef.current && togglePlayPause(), [togglePlayPause]);
        const enterFullscreen = React.useCallback(() => !isOpenRef.current && toggleFullscreen(), [toggleFullscreen]);
        const exitFullscreen = React.useCallback(() => isOpenRef.current && toggleFullscreen(), [toggleFullscreen]);

        const updateStatus = React.useCallback(
            (status: Status) => {
                setStatus(status);
                clearTimeout(loadingFailedTimeout.current);

                if (status.state === 'loading') {
                    loadingFailedTimeout.current = setTimeout(() => {
                        updateStatus({ state: 'error', error: t('errorLoadingTimeout') });
                    }, 5000);
                }
            },
            [t, setStatus]
        );
        const reset = React.useCallback(() => {
            pause();
            exitFullscreen();
            updateDuration(null);
            updateCurrentTime(0);
            setStatus({ state: 'new' });
            clearTimeout(loadingFailedTimeout.current);
            // here should be status update to "new", but that comes in video pr
        }, [pause, exitFullscreen, updateDuration, updateCurrentTime, setStatus]);

        React.useEffect(() => () => clearTimeout(loadingFailedTimeout.current), []);

        const isNewDispatcher = React.useRef<boolean>(true);
        const mediaChangeDispatcher = React.useMemo(() => {
            isNewDispatcher.current = true;

            return {
                updateCurrentTime,
                updateVolume,
                updateDuration,
                updateStatus,
                play,
                pause,
                enterFullscreen,
                exitFullscreen,
                reset
            };
        }, [
            updateCurrentTime,
            updateStatus,
            updateVolume,
            updateDuration,
            play,
            pause,
            enterFullscreen,
            exitFullscreen,
            reset
        ]);

        React.useEffect(() => {
            if (isNewDispatcher.current) {
                isNewDispatcher.current = false;
            } else {
                mediaChangeDispatcher.reset();
            }
        }, [url, mediaChangeDispatcher]);

        React.useEffect(() => {
            setTimeout(() => onStateChange({ ...state }, mediaChangeDispatcher), 0);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [
            state.isPlaying,
            state.isOpen,
            state.volume,
            state.duration,
            state.currentTime,
            onStateChange,
            mediaChangeDispatcher
        ]);

        return [state, mediaChangeDispatcher];
    };

    return usePlayerState;
};

export { translations };
