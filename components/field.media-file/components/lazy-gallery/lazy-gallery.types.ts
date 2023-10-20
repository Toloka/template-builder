import { CurrentItemContextProps } from '../../contexts/currentItemContext';
import { GalleryWithFullscreenProps } from '../galleryWithFullscreen/galleryWithFullscreen.types';

export type LazyGalleryProps = GalleryWithFullscreenProps & Omit<CurrentItemContextProps, 'length'>;
