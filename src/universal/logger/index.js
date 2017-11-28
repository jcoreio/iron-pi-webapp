/**
 * @flow
 *
 * Simple replacement for log4js that can run in the browser. Doing all logging through
 * these functions allows us to easily swap in another logging framework or appender later.
 */

import _ from 'lodash'

export type Logger = {
  trace: (...args: Array<any>) => void,
  debug: (...args: Array<any>) => void,
  info: (...args: Array<any>) => void,
  warn: (...args: Array<any>) => void,
  error: (...args: Array<any>) => void,
  fatal: (...args: Array<any>) => void
}

export const LOG_LEVEL_TRACE = 1
export const LOG_LEVEL_DEBUG = 2
export const LOG_LEVEL_INFO = 3
export const LOG_LEVEL_WARN = 4
export const LOG_LEVEL_ERROR = 5
export const LOG_LEVEL_FATAL = 6

export const logLevelToName = {
  [LOG_LEVEL_TRACE]: 'TRACE',
  [LOG_LEVEL_DEBUG]: 'DEBUG',
  [LOG_LEVEL_INFO]: 'INFO',
  [LOG_LEVEL_WARN]: 'WARN',
  [LOG_LEVEL_ERROR]: 'ERROR',
  [LOG_LEVEL_FATAL]: 'FATAL',
}

export const nameToLogLevel = _.invert(logLevelToName)

export default function logger(loggerName: string): Logger & {setLevel: (level: string) => void} {
  let logLevel: number = nameToLogLevel[process.env.LOG_LEVEL || 'INFO'] || LOG_LEVEL_INFO
  const log = (level: number, ...args: Array<any>) => {
    /* eslint-disable no-console */
    const logFunc = (level >= LOG_LEVEL_ERROR) ? console.error : console.log
    if (level >= logLevel) {
      logFunc(`[${loggerName}] ${logLevelToName[level]}`, ...args)
    }
  }
  const setLevel = (level: string) => {
    const newLevel = nameToLogLevel[level]
    if (newLevel) {
      logLevel = newLevel
      console.log('log level is ', logLevel, typeof logLevel)
    } else {
      log(LOG_LEVEL_ERROR, new Error(`could not set log level to ${level}: must be one of ${_.values(logLevelToName).join(', ')}`).stack)
    }
  }
  return {
    trace: (...args: Array<any>) => log(LOG_LEVEL_TRACE, ...args),
    debug: (...args: Array<any>) => log(LOG_LEVEL_DEBUG, ...args),
    info: (...args: Array<any>) => log(LOG_LEVEL_INFO, ...args),
    warn: (...args: Array<any>) => log(LOG_LEVEL_WARN, ...args),
    error: (...args: Array<any>) => log(LOG_LEVEL_ERROR, ...args),
    fatal: (...args: Array<any>) => log(LOG_LEVEL_FATAL, ...args),
    setLevel
  }
}
