import { TypedUploadItem } from '../../hooks/useTypedItems';

export interface SliderProps {
    items: TypedUploadItem[];
    toggleFullscreen?: () => void;
    mode?: 'block' | 'fullscreen';
    withZoom?: boolean;
    controlClassName?: string;
}
