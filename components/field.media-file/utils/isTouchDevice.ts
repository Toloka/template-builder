export const isTouchDevice = () =>
    'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.maxTouchPoints > 0;
