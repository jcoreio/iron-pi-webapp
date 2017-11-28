/* global browser */

import mergeClientCoverage from "./mergeClientCoverage"
import rootUrl from "./rootUrl"

export default async function navigateTo(url) {
  const ROOT_URL = rootUrl()
  const current = await browser.getUrl()
  if (current && current !== ROOT_URL + url) await mergeClientCoverage()
  await browser.url(ROOT_URL + url)
}

