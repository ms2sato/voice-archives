const common = require('./webpack.common')

const CompressionWebpackPlugin = require('compression-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const {
  CleanWebpackPlugin
} = require('clean-webpack-plugin')

const plugins = [
  common.indexHtmlWebpackPlugin(),
  common.definePluigin()
]

plugins.push(
  new CleanWebpackPlugin,
  new CompressionWebpackPlugin({
    test: /\.js$/
  }),
  new ExtractTextPlugin('static/css/bundle.[chunkhash].css')
)

const moduleRules = [
  common.tsxModuleRule(),
  {
    test: /\.css$/,
    use: ExtractTextPlugin.extract({
      fallback: 'style-loader',
      use: [{
          loader: 'css-loader',
          options: {
            modules: {
              localIdentName: common.cssModulesScopedName
            },
            importLoaders: 1,
            sourceMap: true,
          }
        },
        'postcss-loader',
      ]
    })
  },
  common.imageModuleRule()
]

module.exports = {
  mode: 'production',
  context: common.context,
  entry: ['./polyfills.ts', './index.tsx'],
  output: {
    filename: 'static/js/bundle.[chunkhash].js',
    publicPath: '/',
    path: common.distPath
  },
  resolve: common.resolve,
  module: {
    rules: moduleRules,
  },
  plugins,
  devtool: common.devtool,
  performance: false
}