const { resolve } = require('path')

module.exports = {
  devtool: 'cheap-eval-sourcemap',

  entry: {
    'targa-service-worker': resolve(__dirname, 'src', 'sw'),
  },

  resolve: {
    extensions: ['.ts', '.js'],
  },

  module: {
    rules: [
      { test: /\.ts$/, loader: 'ts-loader' },
    ],
  },

  devServer: {
    port: '8080',
    compress: true,
    contentBase: [resolve(__dirname, 'assets'), resolve(__dirname, 'dist')],
  },
}
