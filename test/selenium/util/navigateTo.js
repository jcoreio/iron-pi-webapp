/* global browser */

import mergeClientCoverage from "./mergeClientCoverage"

export default async function navigateTo(url) {
  await mergeClientCoverage()
  await browser.url(url)
}
