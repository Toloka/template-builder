export const HTTP_URL_PATTERN =
    '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$';

export const HTTP_URL_REGEXP = new RegExp(HTTP_URL_PATTERN);
