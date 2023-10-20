module.exports = function(api) {
    const presets = [
        require('@babel/preset-react'),
        [
            require('@babel/preset-typescript'),
            {
                onlyRemoveTypeImports: true
            }
        ],
        [require('@babel/preset-env'), { modules: api.env('test') ? 'cjs' : false }]
    ];

    const plugins = [
        require('@babel/plugin-proposal-class-properties'),
        require('@babel/plugin-proposal-object-rest-spread')
    ];

    return {
        presets,
        plugins
    };
};
