import { Core } from '@toloka-tb/core/coreComponentApi';
import { action, observable } from 'mobx';

interface InitParams {
    element: HTMLMediaElement;
    url: string;
}

export type PlayerError = 'unknown' | 'aborted' | 'network' | 'decode' | 'not-supported';

type PlayerState = {
    played: boolean;
    playedFully: boolean;
    error?: PlayerError;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
};

export type PlayerStore = PlayerState & {
    // Можно удалить после переезда всех media компонентов на новый store
    playerStoreVersion: number;

    init(params: InitParams): void;
    dispose(): void;

    play(): void;
    pause(): void;
    playPause(): void;
    seek(timeInSeconds: number): void;
};

export const createPlayerStore = (): PlayerStore => {
    let _media: HTMLMediaElement | undefined;

    const playerState: PlayerState = observable({
        played: false,
        playedFully: false,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        error: undefined
    });

    const _handlePlay = action(() => {
        playerState.played = true;
        playerState.isPlaying = true;
    });

    const _handlePause = action(() => {
        playerState.isPlaying = false;
    });

    const _handleEnded = action(() => {
        playerState.playedFully = true;
        playerState.isPlaying = false;
    });

    const _handleTimeUpdate = action(() => {
        if (!_media) {
            return;
        }

        playerState.currentTime = _media.currentTime;
    });

    const _handleDurationChange = action(() => {
        if (!_media) {
            return;
        }

        playerState.duration = _media.duration;
    });

    const _mapMediaError = (error: MediaError): PlayerError => {
        switch (error.code) {
            case error.MEDIA_ERR_ABORTED:
                return 'aborted';
            case error.MEDIA_ERR_NETWORK:
                return 'network';
            case error.MEDIA_ERR_DECODE:
                return 'decode';
            case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                return 'not-supported';
            default:
                return 'unknown';
        }
    };

    const _handleError = action(() => {
        const mediaError = _media?.error;

        playerState.error = mediaError ? _mapMediaError(mediaError) : 'unknown';
    });

    const _subscribe = (element: HTMLMediaElement) => {
        element.addEventListener('play', _handlePlay);
        element.addEventListener('pause', _handlePause);
        element.addEventListener('ended', _handleEnded);
        element.addEventListener('durationchange', _handleDurationChange);
        element.addEventListener('error', _handleError);

        // Note: Seeking while paused does not fire timeupdate event
        element.addEventListener('timeupdate', _handleTimeUpdate);
        element.addEventListener('seeked', _handleTimeUpdate);
    };

    const _unsubscribe = (element: HTMLMediaElement) => {
        element.removeEventListener('play', _handlePlay);
        element.removeEventListener('pause', _handlePause);
        element.removeEventListener('ended', _handleEnded);
        element.removeEventListener('durationchange', _handleDurationChange);
        element.removeEventListener('error', _handleError);

        element.removeEventListener('timeupdate', _handleTimeUpdate);
        element.removeEventListener('seeked', _handleTimeUpdate);
    };

    const playPause = () => {
        if (!_media) {
            return;
        }

        if (_media.paused) {
            _media.play();
        } else {
            _media.pause();
        }
    };

    const play = () => {
        if (!_media) {
            return;
        }

        _media.play();
    };

    const pause = () => {
        if (!_media) {
            return;
        }

        _media.pause();
    };

    const seek = (time: number) => {
        if (!_media) {
            return;
        }

        _media.currentTime = time;

        // Optimistic position update
        playerState.currentTime = time;
    };

    const init = ({ element, url }: InitParams) => {
        _media = element;

        _subscribe(element);
        element.src = url;
        element.load();
    };

    const dispose = () => {
        if (_media) {
            _media.src = '';
            _media.load();
            _unsubscribe(_media);
        }
    };

    const playerStore: PlayerStore = observable({
        playerStoreVersion: 2,

        get played() {
            return playerState.played;
        },
        get playedFully() {
            return playerState.playedFully;
        },
        get isPlaying() {
            return playerState.isPlaying;
        },
        get currentTime() {
            return playerState.currentTime;
        },
        get duration() {
            return playerState.duration;
        },
        get error() {
            return playerState.error;
        },

        init,
        dispose,

        play,
        pause,
        playPause,
        seek
    });

    return playerStore;
};

export const createUsePlayerStore = (core: Core) => {
    return (): PlayerStore => {
        const bag = core._lowLevel.useCtxBag();
        const key = bag.component.__tbViewKey;
        const viewStore = bag.tb.viewState;

        if (!(key in viewStore)) {
            viewStore[key] = createPlayerStore();
        }

        return viewStore[key] as PlayerStore;
    };
};
