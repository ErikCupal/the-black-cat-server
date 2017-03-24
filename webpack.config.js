const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals')

const config = (debug) => ({

  target: 'node',

  entry: [
    './src/index.ts',
  ],

  output: {
    filename: 'index.js',
    path: './build/'
  },

  devtool: 'source-map',

  externals: [nodeExternals()],

  resolve: {
    extensions: ['.ts', '.js'],
    modules: ['node_modules'],
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          { loader: 'babel-loader' },
          { loader: 'ts-loader' },
        ]
      },
    ]
  }
})

module.exports = (env = {}) => {
  const debug = env.NODE_ENV !== 'production'
  return config(config())
}