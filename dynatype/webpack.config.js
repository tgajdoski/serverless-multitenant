module.exports = {
    entry: './testOrigin.ts',
    target: 'node',
    output: {
        libraryTarget: 'commonjs2',
        path: '.webpack',
        filename: 'exported.js',
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            loader: 'babel-loader',
            query: {
                presets: ['es2015']
            }
        },
        {
            test: /\.ts(x?)$/,
            exclude: /(node_modules|bower_components)/,
            loader: 'ts-loader'
        },
        {
            test: /\.json$/,
            loader: 'json-loader'
        }]
    },
    externals: ["aws-sdk"],
};