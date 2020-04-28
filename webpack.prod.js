//@see https://qiita.com/ovrmrw/items/d3d7ff119778f82c9672

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CompressionWebpackPlugin = require('compression-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = function (env = {}) {

  const context = process.cwd()
  const cssModulesScopedName = '[path]___[name]__[local]___[hash:base64:5]'
  let entry
  let outputFilename
  let plugins = []
  let moduleRules = []
  let optimization = {}

  ////////////////////////////////////// entry
  entry = ['./config/polyfills.ts', './src/index.tsx']

  ////////////////////////////////////// output.filename
  outputFilename = 'static/js/bundle.[chunkhash].js'

  ////////////////////////////////////// plugins
  plugins.push(
    new HtmlWebpackPlugin({
      template: 'public/index.html',
      filename: 'index.html'
    })
  )

  plugins.push(
    new CompressionWebpackPlugin({
      test: /\.js$/
    }),
    new ExtractTextPlugin('static/css/bundle.[chunkhash].css')
  )

  ////////////////////////////////////// module.rules
  moduleRules.push({
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
  })

  return {
    mode: 'production',
    context,
    entry,
    output: {
      filename: outputFilename,
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
}