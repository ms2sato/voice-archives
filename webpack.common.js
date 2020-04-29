const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const cssModulesScopedName = '[path]___[name]__[local]___[hash:base64:5]'

module.exports = {
  context: path.resolve(__dirname, 'src'),
  resolve:  {
    extensions: ['.ts', '.tsx', '.js', '.json']
  },
  distPath: path.join(__dirname, 'dist'),
  devtool: 'source-map',
  cssModulesScopedName,
  indexHtmlWebpackPlugin: function indexHtmlWebpackPlugin() {
    return new HtmlWebpackPlugin({
      template: 'index.html',
      filename: 'index.html'
    });
  },
  tsxModuleRule: function tsxModuleRule() {
    return {
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
    }
  },
  imageModuleRule: function imageModuleRule() {
    return {
      test: /\.(jpg|jpeg|png|gif|svg)$/,
      loaders: 'file-loader?name=[name].[ext]',
      options: {
        outputPath: 'images'
      },
    }
  }
}