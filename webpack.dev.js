const { resolve } = require('path')
const merge = require('webpack-merge')
const common = require('./webpack.common.js')

module.exports = merge(common, {
  mode: 'development',

  devtool: 'inline-source-map',

  devServer: {
    port: '8080',
    compress: true,
    contentBase: [resolve(__dirname, 'assets'), resolve(__dirname, 'dist')],
  },
})
