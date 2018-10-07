const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './gqlfacade.ts',
  target: 'node',
  output: {
    libraryTarget: 'commonjs',
    path: path.resolve(__dirname, '.webpack'),
    filename: 'projectservice.js',
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
        presets: ['es2017']
      }
    },
    {
      test: /\.ts(x?)$/,
      exclude: /(node_modules|bower_components)/,
      loader: 'ts-loader'
    },
    {
      test: /\.json$/,
      exclude: /(node_modules|bower_components)/,
      loader: 'json-loader'
    },
    {
      test: /\.(graphql|gql)$/,
      exclude: /(node_modules|bower_components)/,
      loader: 'graphql-tag/loader'
    }]
  },
  externals: ["aws-sdk"],
  plugins: [
    new CopyWebpackPlugin([
      { from: 'schemas/projectservice.gql', to: 'schemas' }
    ])
  ]
};
