const path = require('path');
/*
module.exports = {
    mode: 'production',
    entry: './src/index.js',
    optimization: {
        minimize: true,
      },
    output: {
        path: path.resolve(__dirname, 'www'),
        filename: 'index.bundle.js',
        libraryTarget: 'var',
        library: 'EntryPoint'
    },
    // devtool: 'inline-source-map'
};
*/
module.exports = {
    mode: 'development',
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'www'),
        filename: 'index.bundle.js',
        libraryTarget: 'var',
        library: 'EntryPoint'
    },
    // devtool: 'inline-source-map'
};
