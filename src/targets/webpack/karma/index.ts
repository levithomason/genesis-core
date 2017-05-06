import { assoc, reduce } from 'halcyon'
import * as path from 'path'
import * as webpack from 'webpack'
import { resolveLocalPath } from '../../../utils/paths'

export interface KarmaOptions {
  basePath: string,
  enzyme?: boolean,
  watch?: boolean,
}
export default function createKarmaConfig (webpackConfig, opts: KarmaOptions) {
  const files: Array<string> = []
  files.push(resolveLocalPath('src/targets/webpack/karma/plugins/mocha.js'))
  if (opts.enzyme) files.push(resolveLocalPath('src/targets/webpack/karma/plugins/enzyme.js'))
  files.push(resolveLocalPath('src/targets/webpack/karma/plugins/dirty-chai.js'))
  files.push(resolveLocalPath('src/targets/webpack/karma/plugins/test-importer.js'))

  const karmaConfig = {
    basePath: opts.basePath,
    browsers: ['PhantomJS'],
    coverageReporter: {
      reporters: [
        { type: 'text-summary' },
      ],
    },
    files,
    frameworks: ['mocha'],
    reporters: ['mocha'],
    logLevel: 'WARN',
    preprocessors: reduce((acc, file) => assoc(file, ['webpack'], acc), {}, files),
    singleRun: !opts.watch,
    browserConsoleLogOptions: {
      terminal: true,
      format: '%b %T: %m',
      level: '',
    },
    webpack: {
      entry: files,
      devtool: 'source-map',
      module: webpackConfig.module,
      plugins: webpackConfig.plugins.concat([
        new webpack.DefinePlugin({
          __TESTS_ROOT__: JSON.stringify(path.resolve(opts.basePath, 'test')),
          __TESTS_PATTERN__: /\.(spec|test)\.(js|ts|tsx)$/,
        })
      ]),
      resolve: webpackConfig.resolve,
      externals: Object.assign({}, webpackConfig.externals, {
        'react/addons': true,
        'react/lib/ReactContext': true,
        'react/lib/ExecutionEnvironment': true,
      })
    },
    webpackMiddleware: {
      stats: 'errors-only',
      noInfo: true,
    },
  }

  return karmaConfig
}