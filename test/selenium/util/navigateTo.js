/* global browser */

import mergeClientCoverage from "./mergeClientCoverage"
import requireEnv from '../../../src/universal/util/requireEnv'

function resolve(url) {
  if (url[0] === '/') return requireEnv('ROOT_URL') + url
  return url
}

export default async function navigateTo(url) {
  const current = await browser.getUrl()
  if (current && resolve(current) !== resolve(url)) await mergeClientCoverage()
  await browser.url(url)
}

