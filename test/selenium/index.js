/* global browser */

import * as webdriverio from 'webdriverio'
import path from 'path'
import mergeClientCoverage from './util/mergeClientCoverage'
import fs from 'fs-extra'
import superagent from './util/superagent'
import resolveUrl from './util/resolveUrl'

const root = path.resolve(__dirname, '..', '..')
const errorShots = path.resolve(root, 'errorShots')

const seleniumConfigs = [
  {
    desiredCapabilities: {
      browserName: 'chrome',
      chromeOptions: {
        args: ['--headless', '--disable-gpu', '--window-size=1280,800'],
      },
    },
  },
  {
    desiredCapabilities: {
      browserName: 'firefox',
    },
  },
]

describe('selenium tests', function () {
  this.timeout(30000)

  before(async function () {
    try {
      await superagent.get('/')
    } catch (error) {
      throw new Error(`Can't connect to webapp: ${error.message}`)
    }
  })

  seleniumConfigs.forEach(config => {
    const {desiredCapabilities: {browserName}} = config
    describe(browserName, function () {
      before(async function () {
        try {
          global.browser = webdriverio.remote({
            ...config,
            logLevel: process.env.WDIO_LOG_LEVEL || 'silent',
            baseUrl: resolveUrl('/'),
          })
          await browser.init()
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
        if (state === 'failed') {
          await fs.mkdirs(errorShots)
          const screenshotFile = path.join(errorShots, `ERROR_${browserName}_${title.replace(/[^a-z0-9 ]/ig, '_')}_${new Date().toISOString()}.png`)
          await browser.saveScreenshot(screenshotFile)
          console.log('Saved screenshot to', screenshotFile) // eslint-disable-line no-console

          await fs.mkdirs(errorShots)
          const logFile = path.join(errorShots, `ERROR_${browserName}_${title.replace(/[^a-z0-9 ]/ig, '_')}_${new Date().toISOString()}.log`)
          const logs = (await browser.log('browser')).value
          await fs.writeFile(logFile, logs.map(({message}) => message).join('\n'), 'utf8')
        }

        await mergeClientCoverage()
      })

      require('./basicTests')()
    })
  })
})


