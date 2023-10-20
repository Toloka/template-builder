exports.scenarios = (docsUrl) => [
    {
        label: 'view.alert',
        url: `${docsUrl}/View/ActionButton`,
        postInteractionWait: 100,
        selectors: ['[data-preview="ActionButton"]'],
        scrollToSelector: '[data-preview="ActionButton"]'
    }
];
