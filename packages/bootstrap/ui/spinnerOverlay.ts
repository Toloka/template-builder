import styles from './spinnerOverlay.less';

// prepare dom
const hostNode = document.createElement('div');

hostNode.innerHTML = `
    <div class="${styles.main}">
        <div class="${styles.spin}">
        </div>
    </div>
    <div class="${styles.errors}" id="tb-bootstrap-ui-errors"></div>
`;

const errorsNode = hostNode.querySelector('#tb-bootstrap-ui-errors')!;

hostNode.classList.add(styles.host);

const onDOMReady = () => {
    document.body.appendChild(hostNode);
};

if (['complete', 'loaded', 'interactive'].includes(document.readyState)) {
    onDOMReady();
} else {
    window.addEventListener('DOMContentLoaded', onDOMReady);
}

const show = () => {
    if (!hostNode.classList.contains(styles.hostVisible)) {
        hostNode.classList.add(styles.hostVisible);
    }
};

const hide = () => {
    hostNode.classList.remove(styles.hostVisible);
};

const error = (err: Error) => {
    // eslint-disable-next-line no-console
    console.error(err);

    const errorNode = document.createElement('div');

    errorNode.classList.add(styles.error);
    errorNode.textContent = err.message || JSON.stringify(err);
    errorsNode.appendChild(errorNode);
};

export const spinnerOverlayUI = {
    show,
    hide,
    error
};
