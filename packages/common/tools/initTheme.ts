import { configureRootTheme, Theme } from '@yandex/ui/Theme';

import './theme/_capacity/Theme_capacity_crowd.css';
import './theme/_color/Theme_color_crowd.css';
import './theme/_size/Theme_size_crowd.css';
import './theme/_space/Theme_space_crowd.css';
import './theme/_cosmetic/Theme_cosmetic_crowd.css';
import './theme/mixins.css';

const theme: Theme = {
    color: 'crowd',
    capacity: 'crowd',
    space: 'crowd',
    cosmetic: 'crowd',
    size: 'crowd',
};

export const initTheme = () => configureRootTheme({ theme });
