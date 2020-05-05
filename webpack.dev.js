const common = require('./webpack.common');

const plugins = [
  common.indexHtmlWebpackPlugin()
]

const moduleRules = [
  common.tsxModuleRule(),
  {
    test: /\.css$/,
    use: ['style-loader',
      {
        loader: 'css-loader',
        options: {
          modules: {
            localIdentName: common.cssModulesScopedName, // @see https://github.com/rails/webpacker/issues/2197#issuecomment-517234086
          },
          importLoaders: 1,
          sourceMap: true,
        }
      },
      'postcss-loader',
    ]
  },
  common.imageModuleRule()
]

module.exports = {
  mode: 'development',
  context: common.context,
  entry: {
    main: './index.tsx',
    polyfills: './polyfills.ts',
  },
  output: {
    filename: 'static/js/[name].js',
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
