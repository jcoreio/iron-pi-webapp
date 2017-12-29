/* global browser */
import mergeCoverage from './mergeCoverage'

// istanbul ignore next
async function mergeClientCoverage() {
  /* eslint-disable no-undef */
  const browserCoverage = (await browser.execute(() => window.__coverage__)).value
  /* eslint-enable no-undef */

  if (browserCoverage) mergeCoverage(browserCoverage)
}

export default mergeClientCoverage


