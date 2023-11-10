import { HTTP_URL_PATTERN } from '@yandex-tb/common/constants/url';
import { makeActionSchema } from '@toloka-tb/schemas/make';

export const schema = makeActionSchema('action.open-link', {
    schema: {
        properties: {
            payload: {
                type: 'string',
                pattern: HTTP_URL_PATTERN,
                default: 'https://google.com'
            }
        },
        default: {
            type: 'action.open-link',
            payload: 'https://google.com'
        }
    }
});
