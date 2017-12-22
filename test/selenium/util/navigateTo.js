/* global browser */

import mergeClientCoverage from "./mergeClientCoverage"
import resolveUrl from './resolveUrl'

export default async function navigateTo(url) {
  const current = await browser.getUrl()
  if (current && resolveUrl(current) !== resolveUrl(url)) await mergeClientCoverage()
  await browser.url(url)
}

