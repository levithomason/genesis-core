const { merge } = require('redash')
const path = require('path')
const express = require('express')
const webpack = require('webpack')
const debug = require('debug')('genesis:core:create-dev-server')
const createProjectConfig = require('../configs/create-project-config')

// createDevServer : GenesisConfig -> Server
const createDevServer = (opts) => {
  debug('Creating server...')
  opts = createProjectConfig(opts)

  const resolveProjectPath = p => path.resolve(opts.project_root, p)
  const webpackConfig = require('../configs/create-webpack-config')(opts)

  // Create server
  const app = express()
  const compiler = webpack(webpackConfig)
  const publicPath = `${opts.server_protocol}://${opts.server_host}:${opts.server_port}/`
  const webpackDevMiddleware = require('webpack-dev-middleware')(compiler, {
    publicPath: publicPath,
    contentBase: resolveProjectPath('src'),
    hot: true,
    lazy: false,
    noInfo: !opts.verbose,
    progress: opts.verbose,
    publicPath: webpackConfig.output.publicPath,
    stats: opts.verbose ? opts.compiler_stats : 'none',
    quiet: !opts.verbose,
  })
  app.use(require('connect-history-api-fallback')({ verbose: false }))
  app.use(webpackDevMiddleware)
  app.use(require('webpack-hot-middleware')(compiler))

  // Serve static assets from ~/public since Webpack is unaware of
  // these files. This middleware doesn't need to be enabled outside
  // of development since the contents of directory will be copied
  // into ~/dist when the application is compiled.
  app.use(express.static(resolveProjectPath('public')))
  app.start = () => new Promise((resolve, reject) => {
    app.listen(opts.server_port, () => {
      debug(`Listening at ${publicPath}.`)
      resolve(app)
    })
  })
  return app
}

module.exports = createDevServer