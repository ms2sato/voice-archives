//@see https://qiita.com/ovrmrw/items/d3d7ff119778f82c9672

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = function (env = {}) {
  const cssModulesScopedName = '[path]___[name]__[local]___[hash:base64:5]'
  const plugins = []
  const moduleRules = []

  ////////////////////////////////////// plugins
  plugins.push(
    new HtmlWebpackPlugin({
      template: 'public/index.html',
      filename: 'index.html'
    }),
    new CleanWebpackPlugin
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
    use: ['style-loader',
      {
        loader: 'css-loader',
        options: {
          modules: {
            localIdentName: cssModulesScopedName,  // @see https://github.com/rails/webpacker/issues/2197#issuecomment-517234086
          },
          importLoaders: 1,
          sourceMap: true,
        }
      },
      'postcss-loader',
    ]
  })

  return {
    mode: 'development',
    context: process.cwd(),
    entry: {
      main: './src/index.tsx',
      vendor: './config/vendor.ts',
      polyfills: './config/polyfills.ts',
    },
    output: {
      filename: 'static/js/[name].js',
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
    performance: false,
    optimization: {
      splitChunks: {
        name: 'vendor',
        chunks: 'initial',
      }
    }
  }
}