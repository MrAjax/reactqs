const path = require('path')
const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')

const PATHS = {
  src: path.resolve(__dirname, 'src'),
  assets: path.resolve(__dirname, 'src', 'assets'),
  dist: path.resolve(__dirname, 'dist')
}

module.exports = (env = { prod: false }) => ({
  entry: {
    polyfills: path.resolve(PATHS.src, 'polyfills.js'),
    app: path.resolve(PATHS.src, 'index.js')
  },
  output: {
    path: PATHS.dist,
    filename: '[name].[hash].bundle.js'
  },
  module: {
    rules: [
      ...(env.prod ? [
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: { importLoaders: 1 }
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: (loader) => [
                  require('postcss-import')({ root: loader.resourcePath }),
                  require('autoprefixer')({
                    browsers: ['ie >= 8', 'last 4 version']
                  }),
                  require('cssnano')()
                ]
              }
            }
          ]
        },
        {
          test: /\.html$/,
          use: [
            {
              loader: 'html-loader',
              options: {
                minimize: true,
                removeComments: true,
                collapseWhitespace: true
              }
            }
          ]
        }
      ] : [
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        }
      ]),
      {
        test: /\.jsx?$/,
        include: PATHS.src,
        exclude: /node_modules/,
        loader: [
          'babel-loader',
          {
            loader: 'eslint-loader',
            options: { quiet: true }
          }
        ]
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[hash].[ext]'
            }
          },
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                progressive: true,
                quality: 70
              }
            }
          }
        ]
      },
      {
        test: /\.(otf|eot|svg|ttf|woff|woff2)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[hash].[ext]'
          }
        }
      }
    ]
  },
  resolve: {
    mainFiles: ['index'],
    modules: ['node_modules', PATHS.src],
    extensions: ['*', '.js', '.jsx', '.css']
  },
  ...(env.prod ? {
    optimization: {
      minimizer: [
        new UglifyJsPlugin({
          cache: true,
          parallel: true,
          uglifyOptions: {
            ie8: true,
            output: {
              comments: false
            }
          }
        })
      ],
      minimize: true,
      splitChunks: {
        cacheGroups: {
          default: false,
          vendors: {
            test: /node_modules/,
            name: 'vendor',
            chunks: 'all',
            reuseExistingChunk: true
          },
          styles: {
            name: 'app',
            test: /\.css$/,
            chunks: 'all',
            enforce: true
          }
        }
      }
    }
  } : {
    devtool: 'inline-source-map',
    devServer: {
      hot: true,
      inline: true,
      overlay: true,
      compress: true,
      historyApiFallback: true,
      contentBase: PATHS.src
    }
  }),
  plugins: [
    new CopyWebpackPlugin([
      {
        from: PATHS.assets,
        ignore: ['.gitkeep']
      }
    ]),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(PATHS.src, 'index.html'),
      path: PATHS.dist,
      minify: env.prod ? {
        removeComments: true,
        removeRedundantAttributes: true,
        collapseWhitespace: true,
        collapseInlineTagWhitespace: true
      } : {}
    }),
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(!process.env.NODE_ENV || !env.prod)
    }),
    new CleanWebpackPlugin(PATHS.dist),
    ...(env.prod ? [
      new webpack.optimize.ModuleConcatenationPlugin(),
      new webpack.HashedModuleIdsPlugin(),
      new MiniCssExtractPlugin({
        filename: '[name].[hash].bandle.css'
      })
    ] : [
      new webpack.NamedModulesPlugin(),
      new webpack.HotModuleReplacementPlugin()
    ])
  ]
})
