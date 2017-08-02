import './utils/bail-on-rejected-promise'
import { ICompiler, ICompilerConfig } from './types'
import WebAppCompiler from './compilers/web-app'
import * as logger from './utils/logger'

const COMPILER_DEFAULTS: ICompilerConfig = {
  env          : process.env.NODE_ENV,
  main         : 'main',
  basePath     : process.cwd(),
  srcDir       : 'src',
  outDir       : 'dist',
  publicPath   : '/',
  templatePath : null,
  externals    : {},
  globals      : {},
  sourcemaps   : true,
  vendors      : [],
  verbose      : false,
}

export function createCompilerConfig (overrides: Partial<ICompilerConfig>) {
  return {
    ...COMPILER_DEFAULTS,
    ...overrides,
  }
}
export default (opts: Partial<ICompilerConfig>): ICompiler => {
  const config = createCompilerConfig(opts)

  if (!config.env) {
    config.env = 'development'
    logger.warn(
      'No environment detected; using "development" as the default environment.\n  ' +
      'Set process.env.NODE_ENV or the "env" property in your genesis configuration.'
    )
  }
  return new WebAppCompiler(config)
}
