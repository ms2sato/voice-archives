const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CompressionWebpackPlugin = require('compression-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const {
  CleanWebpackPlugin
} = require('clean-webpack-plugin')

const cssModulesScopedName = '[path]___[name]__[local]___[hash:base64:5]'

const plugins = [
  new HtmlWebpackPlugin({
    template: 'public/index.html',
    filename: 'index.html'
  }),
  new CleanWebpackPlugin
]

plugins.push(
  new CompressionWebpackPlugin({
    test: /\.js$/
  }),
  new ExtractTextPlugin('static/css/bundle.[chunkhash].css')
)

const moduleRules = [{
  test: /\.tsx?$/,
  exclude: [/node_modules/],
  use: [{
      loader: 'babel-loader',
      options: {
        presets: [],
        plugins: [
          'transform-react-jsx',
          ['react-css-modules', {
            generateScopedName: cssModulesScopedName
          }],
        ]
      }
    },
    'awesome-typescript-loader'
  ]
}, {
  test: /\.css$/,
  use: ExtractTextPlugin.extract({
    fallback: 'style-loader',
    use: [{
        loader: 'css-loader',
        options: {
          modules: {
            localIdentName: cssModulesScopedName
          },
          importLoaders: 1,
          sourceMap: true,
        }
      },
      'postcss-loader',
    ]
  })
}]

module.exports = {
  mode: 'production',
  context: process.cwd(),
  entry: ['./config/polyfills.ts', './src/index.tsx'],
  output: {
    filename: 'static/js/bundle.[chunkhash].js',
    path: path.join(__dirname, 'dist')
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json']
  },
  module: {
    rules: moduleRules,
  },
  plugins,
  devtool: 'source-map',
  performance: false
}