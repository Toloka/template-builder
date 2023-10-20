import { TypedUploadItem } from '../../hooks/useTypedItems';

export interface ToolbarProps {
    className?: string;
    currentItem: TypedUploadItem;
    onRotate?: (id: string) => void;
    zoom?: number;
    zoomConfig?: {
        set: (handler: (oldVal: number) => number) => void;
        max: number;
        min: number;
        step: number;
    };
    mode?: 'block' | 'fullscreen';
    toggleFullscreen?: () => void;
}
