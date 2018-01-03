// @flow

const webdriverio = require('webdriverio')
const repl = require('repl')

async function wdioRepl(config: Object): Promise<void> {
  const browser = webdriverio.remote(config)
  await browser.init()
  await browser.setViewportSize({
    width: 1200,
    height: 800,
  })

  const context: any = repl.start('> ').context
  context.browser = global.browser = browser
}

module.exports = wdioRepl

