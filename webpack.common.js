const { resolve } = require('path')
const CleanWebpackPlugin = require('clean-webpack-plugin')

module.exports = {
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

  plugins: [
    new CleanWebpackPlugin(['dist']),
  ],

  performance: {
    assetFilter: function (assetFilename) {
      return assetFilename.match(/\.(js|html|css)$/)
    },
  },
}
