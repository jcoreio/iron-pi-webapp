/* global browser */
import {Collector} from 'istanbul'

// istanbul ignore next
async function mergeClientCoverage() {
  /* eslint-disable no-undef */
  const browserCoverage = (await browser.execute(() => window.__coverage__)).value
  /* eslint-enable no-undef */

  if (browserCoverage) {
    const collector = new Collector()
    collector.add(global.__coverage__)
    collector.add(browserCoverage)
    global.__coverage__ = collector.getFinalCoverage()
  }
}

export default mergeClientCoverage


