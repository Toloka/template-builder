module.exports = {
    ident: 'postcss',
    plugins: [require('autoprefixer')(), require('postcss-flexbugs-fixes')(), require('cssnano')()]
};
