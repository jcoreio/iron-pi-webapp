/* global browser */

import * as webdriverio from 'webdriverio'
import path from 'path'
import mergeClientCoverage from './util/mergeClientCoverage'
import fs from 'fs-extra'
import superagent from './util/superagent'
import resolveUrl from './util/resolveUrl'
import poll from '@jcoreio/poll'
import promisify from 'es6-promisify'
import glob from 'glob'
import mergeCoverage from './util/mergeCoverage'

const root = path.resolve(__dirname, '..', '..')
const errorShots = path.resolve(root, 'errorShots')

let {
  NO_HEADLESS,
  PIPE_SELENIUM_LOG,
  CHROMEDRIVER_VERBOSE,
  GECKODRIVER_LOG_LEVEL,
  WDIO_LOG_LEVEL,
  LOG_EVERYTHING,
} = process.env

if (LOG_EVERYTHING) {
  if (!PIPE_SELENIUM_LOG) PIPE_SELENIUM_LOG = '1'
  if (!CHROMEDRIVER_VERBOSE) CHROMEDRIVER_VERBOSE = '1'
  if (!GECKODRIVER_LOG_LEVEL) GECKODRIVER_LOG_LEVEL = 'trace'
  if (!WDIO_LOG_LEVEL) WDIO_LOG_LEVEL = 'verbose'
}

const seleniumConfigs = [
  {
    desiredCapabilities: {
      browserName: 'chrome',
      chromeOptions: {
        args: [
          NO_HEADLESS ? null : '--headless',
          CHROMEDRIVER_VERBOSE ? '--verbose' : null,
          '--disable-gpu'
        ].filter(Boolean),
      },
    },
  },
  {
    desiredCapabilities: {
      browserName: 'firefox',
      // flag to activate Firefox headless mode (see https://github.com/mozilla/geckodriver/blob/master/README.md#firefox-capabilities for more details about moz:firefoxOptions)
      "moz:firefoxOptions": {
        log: {level: GECKODRIVER_LOG_LEVEL || 'info'},
        args: [
          NO_HEADLESS ? null : '-headless'
        ].filter(Boolean),
      },
    },
  },
]

describe('selenium tests', function () {
  this.timeout(30000)

  let selenium

  before(async function () {
    try {
      await poll(() => superagent.get('/'), 1000).timeout(15000)
    } catch (error) {
      throw new Error(`Can't connect to webapp: ${error.message}`)
    }
    selenium = await promisify(cb => require('selenium-standalone').start(cb))()
    if (PIPE_SELENIUM_LOG) selenium.stderr.pipe(process.stderr)
  })

  after(async function () {
    try {
      const {body: serverCoverage} = await superagent.get('/__coverage__').accept('json')
      if (serverCoverage) mergeCoverage(serverCoverage)
    } catch (error) {
      console.error("Couldn't get server coverage:", error.message) // eslint-disable-line no-console
    }
    if (selenium) selenium.kill()
  })

  seleniumConfigs.forEach(config => {
    const {desiredCapabilities: {browserName}} = config
    describe(browserName, function () {
      before(async function () {
        try {
          global.browser = webdriverio.remote({
            ...config,
            logLevel: WDIO_LOG_LEVEL || 'silent',
            baseUrl: resolveUrl('/'),
          })
          await browser.init()
          await browser.setViewportSize({
            width: 1200,
            height: 800,
          })
        } catch (error) {
          if (error.seleniumStack) throw new Error(error.seleniumStack.message)
          throw error
        }
      })
      beforeEach(function () {
        browser.timeouts('implicit', 1000)
      })
      after(async function () {
        if (browser) await browser.end()
      })

      afterEach(async function () {
        const {state, title} = this.currentTest
        const filePrefix = path.join(errorShots, `ERROR_${browserName}_${title.replace(/[^a-z0-9 ]/ig, '_')}`)
        if (state === 'failed') {
          await fs.mkdirs(errorShots)
          const screenshotFile = `${filePrefix}_${new Date().toISOString()}.png`
          await browser.saveScreenshot(screenshotFile)
          console.log('Saved screenshot to', screenshotFile) // eslint-disable-line no-console

          await fs.mkdirs(errorShots)
          const logFile = `${filePrefix}_${new Date().toISOString()}.log`
          try {
            const logs = (await browser.log('browser')).value
            await fs.writeFile(logFile, logs.map(({message}) => message).join('\n'), 'utf8')
          } catch (error) {
            console.error(error.stack) // eslint-disable-line no-console
          }
        } else {
          const files = await promisify(glob)(filePrefix + '*')
          files.forEach(file => fs.remove(file)) // no need to wait for promise
        }

        await mergeClientCoverage()
      })

      require('./basicTests')()
    })
  })
})


