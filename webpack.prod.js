const merge = require('webpack-merge')
const common = require('./webpack.common.js')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = merge(common, {
  mode: 'production',

  devtool: 'source-map',

  optimization: {
    concatenateModules: true,
  },

  plugins: [
    new CopyWebpackPlugin([{ from: 'assets' }]),
  ],
})
