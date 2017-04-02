const path = require('path')
const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals')

const config = (debug) => ({

  target: 'node',

  entry: [
    './src/index.ts',
  ],

  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, debug ? './build/' : './build-distribution/')
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
  },

  plugins: debug
    ? []
    : [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
      })
    ]
})

module.exports = (env = {}) => {
  const debug = env.NODE_ENV !== 'production'
  return config(debug)
}