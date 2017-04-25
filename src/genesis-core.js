const resolveConfig = require('./configs/create-project-config')

exports.compile = (opts) =>
  require('./lib/create-compiler')(resolveConfig(opts)).start()

exports.createDevMiddleware = (opts) =>
  require('./lib/create-dev-middleware')(resolveConfig(opts))

exports.dev = (opts) =>
  require('./lib/create-dev-server')(resolveConfig(opts)).start()

exports.test = (opts) =>
  require('./lib/create-test-runner')(resolveConfig(opts)).start()

exports.register = (opts) =>
  require('babel-register')(require('./configs/create-babel-config')(opts))
