import { ICompilerConfig } from '../../lib/compiler'
import * as path from 'path'
import * as webpack from 'webpack'
import * as HtmlWebpackPlugin from 'html-webpack-plugin'
import * as ExtractTextPlugin from 'extract-text-webpack-plugin'
import { findGenesisDependency } from '../../utils/paths'

export default function createWebpackConfig (opts: ICompilerConfig) {
  const inProject = (...paths) => path.resolve(opts.basePath, ...paths)
  const inProjectSrc = file => inProject(opts.srcDir, file)

  const __DEV__     = opts.env === 'development'
  const __STAGING__ = opts.env === 'staging'
  const __TEST__    = opts.env === 'test'
  const __PROD__    = opts.env === 'production'

  const config = {
    entry: {
      main: [
        inProjectSrc(opts.main),
      ],
    },
    devtool: opts.env === 'development' ? 'source-map' : 'source-map',
    performance: {
      hints: false,
    },
    output: {
      path: inProject(opts.outDir),
      filename: __DEV__ ? '[name].js' : '[name].[chunkhash].js',
      publicPath: '/',
    },
    resolve: {
      extensions: ['*', '.js', '.json', '.ts', '.tsx'],
    },
    externals: Object.assign({}, opts.externals),
    module: {
      rules: [
        {
          test: /\.(eot|gif|jpg|jpeg|png|svg|ttf|woff|woff2)$/,
          use: findGenesisDependency('file-loader'),
        },
      ] as Array<any>,
    },
    plugins: [
      new webpack.DefinePlugin(Object.assign({
        'process.env' : { NODE_ENV: JSON.stringify(opts.env) },
        __DEV__,
        __STAGING__,
        __TEST__,
        __PROD__,
      }, opts.globals)),
    ],
  }

  // JavaScript
  // ------------------------------------
  config.module.rules.push({
    test: /\.js$/,
    exclude: /node_modules/,
    use: [{
      loader: findGenesisDependency('babel-loader'),
      query: {
        cacheDirectory: true,
        plugins: [
          findGenesisDependency('babel-plugin-transform-runtime'),
        ],
        presets: [
          findGenesisDependency('babel-preset-react'),
          findGenesisDependency('babel-preset-es2015'),
          findGenesisDependency('babel-preset-stage-1'),
        ]
      },
    }],
  })

  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    exclude: /node_modules/,
    use: [{
      loader: findGenesisDependency('awesome-typescript-loader'),
      query: {
        useCache: true,
        configFileName: opts.typescript.configPath,
      },
    }],
  })

  // Styles
  // ------------------------------------
  const extractSass = new ExtractTextPlugin({
    filename: '[name].css',
    disable: __DEV__,
  })

  config.module.rules.push({
    test: /\.(sass|scss)$/,
    exclude: /node_modules/,
    loader: extractSass.extract({
      fallback: findGenesisDependency('style-loader'),
      use: [
        findGenesisDependency('css-loader?sourceMap'),
        {
          loader: findGenesisDependency('sass-loader?sourceMap'),
          query: {
            includePaths: [
              inProjectSrc('styles'),
            ],
          },
        }
      ],
    })
  })
  config.plugins.push(extractSass)

  // HTML Template
  // ------------------------------------
  const htmlWebpackPluginOpts = {
    title: 'Genesis Application',
    inject: true,
    minify: {
      collapseWhitespace: true,
    },
  }
  if (opts.templatePath) {
    htmlWebpackPluginOpts['template'] = opts.templatePath
  }
  config.plugins.push(new HtmlWebpackPlugin(htmlWebpackPluginOpts))

  if (!__TEST__) {
    const bundles = ['manifest']

    if (opts.vendors && opts.vendors.length) {
      bundles.unshift('vendor')
      config.entry['vendor'] = opts.vendors
    }
    config.plugins.push(new webpack.optimize.CommonsChunkPlugin({ names: bundles }))
  }
  if (opts.minify) {
    config.plugins.push(
      new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false,
      }),
      new webpack.optimize.UglifyJsPlugin({
        sourceMap: true,
        compress: {
          warnings: false,
          screw_ie8: true,
          conditionals: true,
          unused: true,
          comparisons: true,
          sequences: true,
          dead_code: true,
          evaluate: true,
          if_return: true,
          join_vars: true,
        },
        output: {
          comments: false,
        },
      })
    )
  }
  return config
}
